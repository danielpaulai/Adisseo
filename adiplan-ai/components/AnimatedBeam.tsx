"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Self-contained "animated beam" — Magic UI-style curve between two DOM nodes.
 * Pure SVG + CSS keyframes (no framer-motion). Works inside a relatively
 * positioned container with the two endpoints already laid out.
 *
 * Renders a faint static wire + a coloured "comet" blip travelling along it,
 * achieved by normalising path length to 100 units and animating
 * stroke-dashoffset.
 */
export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 60,
  delay = 0,
  duration = 3,
  color = "#A70A2D",
  reverse = false,
  beamWidth = 2,
  blipFraction = 0.18,
}: {
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  /** Vertical bend in px (positive = curve dips down before rising). */
  curvature?: number;
  /** Animation delay in seconds. */
  delay?: number;
  /** Animation duration in seconds. */
  duration?: number;
  /** Beam stroke colour. */
  color?: string;
  /** Run the blip in reverse direction. */
  reverse?: boolean;
  beamWidth?: number;
  /** Fraction of the path length the visible blip occupies (0..1). */
  blipFraction?: number;
}) {
  const [path, setPath] = useState("");
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      const c = containerRef.current;
      const a = fromRef.current;
      const b = toRef.current;
      if (!c || !a || !b) return;
      const cr = c.getBoundingClientRect();
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      // Anchor on right-edge of "from" and left-edge of "to" for a nice
      // hub-and-spoke feel; fall back to centre if they overlap horizontally.
      const fromX =
        ar.left + ar.width / 2 < br.left + br.width / 2
          ? ar.right - cr.left
          : ar.left + ar.width / 2 - cr.left;
      const toX =
        br.left + br.width / 2 > ar.left + ar.width / 2
          ? br.left - cr.left
          : br.left + br.width / 2 - cr.left;
      const fromY = ar.top + ar.height / 2 - cr.top;
      const toY = br.top + br.height / 2 - cr.top;

      const midX = (fromX + toX) / 2;
      const c1x = midX;
      const c1y = fromY + curvature;
      const c2x = midX;
      const c2y = toY + curvature;

      setPath(`M ${fromX},${fromY} C ${c1x},${c1y} ${c2x},${c2y} ${toX},${toY}`);
      setSize({ w: cr.width, h: cr.height });
    };

    update();

    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    if (fromRef.current) ro.observe(fromRef.current);
    if (toRef.current) ro.observe(toRef.current);
    window.addEventListener("resize", update);
    // Run again after fonts/images settle.
    const t = setTimeout(update, 80);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      clearTimeout(t);
    };
  }, [containerRef, fromRef, toRef, curvature]);

  if (!path) return null;

  const blip = Math.round(100 * blipFraction);
  const gap = 100 - blip;

  return (
    <svg
      width={size.w}
      height={size.h}
      viewBox={`0 0 ${Math.max(size.w, 1)} ${Math.max(size.h, 1)}`}
      className="pointer-events-none absolute inset-0"
    >
      <path
        d={path}
        stroke="#D8D2C4"
        strokeWidth={1.1}
        fill="none"
        strokeOpacity={0.55}
      />
      <path
        d={path}
        stroke={color}
        strokeWidth={beamWidth}
        strokeLinecap="round"
        fill="none"
        pathLength={100}
        strokeDasharray={`${blip} ${gap}`}
        style={{
          animationName: "adiplan-beam-flow",
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          animationIterationCount: "infinite",
          animationTimingFunction: "linear",
          animationDirection: reverse ? "reverse" : "normal",
          filter: `drop-shadow(0 0 4px ${color}66)`,
        }}
      />
    </svg>
  );
}
