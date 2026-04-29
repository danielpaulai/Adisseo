import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import React from "react";
import {
  type PoultryEmailDeliverable,
  type PoultryEmailBlock,
  deterministicPoultryPack,
} from "@/lib/poultry-pack";

export const runtime = "nodejs";

const CRIMSON = "#A70A2D";
const INK = "#1F252A";
const MUTED = "#6B7280";
const LINE = "#DEDEDE";
const BG = "#FBF9F9";
const ORANGE = "#D97641";

function EmailDoc({
  email,
  campaignName,
  audienceLabel,
  origin,
}: {
  email: PoultryEmailDeliverable;
  campaignName: string;
  audienceLabel: string;
  origin: string;
}) {
  const logoUrl = `${origin}/brand/logo.png`;
  return React.createElement(
    Html,
    null,
    React.createElement(Head, null),
    React.createElement(Preview, null, email.preheader),
    React.createElement(
      Body,
      {
        style: {
          backgroundColor: BG,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          color: INK,
          margin: 0,
          padding: 0,
        },
      },
      React.createElement(
        Container,
        {
          style: {
            backgroundColor: "#ffffff",
            maxWidth: "640px",
            margin: "24px auto",
            border: `1px solid ${LINE}`,
            borderRadius: "12px",
            overflow: "hidden",
          },
        },

        // crimson top bar
        React.createElement("div", {
          style: { height: "6px", backgroundColor: CRIMSON },
        }),

        // header
        React.createElement(
          Section,
          {
            style: {
              padding: "24px 28px 8px 28px",
              borderBottom: `1px solid ${LINE}`,
            },
          },
          React.createElement(
            "table",
            { width: "100%", style: { borderCollapse: "collapse" } },
            React.createElement(
              "tbody",
              null,
              React.createElement(
                "tr",
                null,
                React.createElement(
                  "td",
                  { style: { verticalAlign: "top" } },
                  React.createElement(Img, {
                    src: logoUrl,
                    alt: "Adisseo",
                    width: "92",
                    height: "32",
                    style: { display: "block" },
                  })
                ),
                React.createElement(
                  "td",
                  { style: { verticalAlign: "top", textAlign: "right" } },
                  React.createElement(
                    Text,
                    {
                      style: {
                        margin: 0,
                        fontSize: "10px",
                        letterSpacing: "1.2px",
                        textTransform: "uppercase",
                        color: CRIMSON,
                        fontWeight: 700,
                      },
                    },
                    campaignName
                  ),
                  React.createElement(
                    Text,
                    {
                      style: {
                        margin: "2px 0 0 0",
                        fontSize: "11px",
                        color: MUTED,
                      },
                    },
                    audienceLabel
                  )
                )
              )
            )
          )
        ),

        // greeting + intro
        React.createElement(
          Section,
          { style: { padding: "20px 28px 8px 28px" } },
          React.createElement(
            Heading,
            {
              as: "h1",
              style: {
                fontSize: "20px",
                lineHeight: 1.25,
                margin: "0 0 8px 0",
                color: INK,
                fontWeight: 700,
              },
            },
            email.subject
          ),
          React.createElement(
            Text,
            {
              style: {
                margin: "0 0 16px 0",
                fontSize: "14px",
                color: INK,
              },
            },
            email.greeting
          ),
          React.createElement(
            Text,
            {
              style: {
                margin: "0 0 16px 0",
                fontSize: "14px",
                lineHeight: 1.55,
                color: INK,
              },
            },
            email.intro
          )
        ),

        // body blocks
        React.createElement(
          Section,
          { style: { padding: "0 28px 8px 28px" } },
          ...email.body.map((block, i) => renderBlock(block, i))
        ),

        // metrics table
        React.createElement(
          Section,
          { style: { padding: "8px 28px 16px 28px" } },
          React.createElement(
            Text,
            {
              style: {
                margin: "0 0 8px 0",
                fontSize: "10px",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                fontWeight: 700,
                color: ORANGE,
              },
            },
            "Trial summary"
          ),
          React.createElement(
            "table",
            {
              width: "100%",
              style: {
                borderCollapse: "collapse",
                fontSize: "13px",
                border: `1px solid ${LINE}`,
              },
            },
            React.createElement(
              "thead",
              null,
              React.createElement(
                "tr",
                {
                  style: { backgroundColor: "#F3F5F7", color: MUTED },
                },
                ...["Metric", "Control", "Treatment", "Delta"].map((h, i) =>
                  React.createElement(
                    "th",
                    {
                      key: i,
                      style: {
                        textAlign: i === 0 ? "left" : "right",
                        padding: "8px 10px",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: `1px solid ${LINE}`,
                      },
                    },
                    h
                  )
                )
              )
            ),
            React.createElement(
              "tbody",
              null,
              ...email.metricsTable.map((row, i) =>
                React.createElement(
                  "tr",
                  {
                    key: i,
                    style: {
                      borderBottom:
                        i === email.metricsTable.length - 1
                          ? "none"
                          : `1px solid ${LINE}`,
                    },
                  },
                  React.createElement(
                    "td",
                    { style: { padding: "8px 10px", fontWeight: 600 } },
                    row.metric
                  ),
                  React.createElement(
                    "td",
                    {
                      style: {
                        padding: "8px 10px",
                        textAlign: "right",
                        color: MUTED,
                      },
                    },
                    row.control
                  ),
                  React.createElement(
                    "td",
                    {
                      style: {
                        padding: "8px 10px",
                        textAlign: "right",
                        fontWeight: 700,
                      },
                    },
                    row.treatment
                  ),
                  React.createElement(
                    "td",
                    {
                      style: {
                        padding: "8px 10px",
                        textAlign: "right",
                        color: CRIMSON,
                        fontWeight: 700,
                      },
                    },
                    row.delta
                  )
                )
              )
            )
          )
        ),

        // CTA
        React.createElement(
          Section,
          {
            style: {
              padding: "8px 28px 24px 28px",
              textAlign: "center",
            },
          },
          React.createElement(
            Link,
            {
              href: email.ctaHref,
              style: {
                display: "inline-block",
                backgroundColor: CRIMSON,
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
              },
            },
            email.ctaLabel
          )
        ),

        React.createElement(Hr, {
          style: { margin: 0, borderColor: LINE },
        }),

        // sign-off + footer
        React.createElement(
          Section,
          { style: { padding: "16px 28px 24px 28px" } },
          React.createElement(
            Text,
            { style: { margin: 0, fontSize: "13px", color: INK } },
            email.signOff
          ),
          React.createElement(
            Text,
            {
              style: {
                margin: "4px 0 12px 0",
                fontSize: "13px",
                color: INK,
                fontWeight: 700,
              },
            },
            email.signature
          ),
          React.createElement(
            Text,
            {
              style: {
                margin: 0,
                fontSize: "10px",
                color: MUTED,
                lineHeight: 1.5,
              },
            },
            email.footnote
          )
        ),

        // crimson bottom bar
        React.createElement("div", {
          style: { height: "4px", backgroundColor: CRIMSON },
        })
      )
    )
  );
}

function renderBlock(block: PoultryEmailBlock, key: number) {
  if (block.kind === "p") {
    return React.createElement(
      Text,
      {
        key,
        style: {
          margin: "0 0 14px 0",
          fontSize: "14px",
          lineHeight: 1.55,
          color: INK,
        },
      },
      block.text
    );
  }
  if (block.kind === "bullets") {
    return React.createElement(
      "ul",
      {
        key,
        style: {
          margin: "0 0 14px 18px",
          padding: 0,
          fontSize: "14px",
          lineHeight: 1.55,
          color: INK,
        },
      },
      ...block.items.map((it, i) =>
        React.createElement(
          "li",
          { key: i, style: { margin: "0 0 6px 0" } },
          it
        )
      )
    );
  }
  // callout
  return React.createElement(
    "div",
    {
      key,
      style: {
        backgroundColor: "rgba(167,10,45,0.06)",
        borderLeft: `3px solid ${CRIMSON}`,
        padding: "12px 14px",
        margin: "0 0 14px 0",
        borderRadius: "0 6px 6px 0",
      },
    },
    React.createElement(
      Text,
      {
        style: {
          margin: 0,
          fontSize: "10px",
          letterSpacing: "1.2px",
          textTransform: "uppercase",
          color: CRIMSON,
          fontWeight: 700,
        },
      },
      block.label
    ),
    React.createElement(
      Text,
      {
        style: {
          margin: "4px 0 0 0",
          fontSize: "13px",
          lineHeight: 1.5,
          color: INK,
        },
      },
      block.text
    )
  );
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    pack?: { email: PoultryEmailDeliverable };
    campaignId?: string;
    audienceId?: string;
    campaignName?: string;
    audienceLabel?: string;
  };

  let email: PoultryEmailDeliverable;
  if (body.pack?.email) {
    email = body.pack.email;
  } else {
    email = deterministicPoultryPack(
      body.campaignId ?? "agp-free-asia",
      body.audienceId ?? "integrator-cp"
    ).email;
  }

  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;

  const html = await render(
    React.createElement(EmailDoc, {
      email,
      campaignName: body.campaignName ?? "AdiPlan AI · AGP-Free Asia",
      audienceLabel: body.audienceLabel ?? "Adisseo Poultry APAC",
      origin,
    })
  );

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, max-age=60",
    },
  });
}
