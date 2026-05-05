import { redirect } from "next/navigation";
import { COMPETITOR_WATCH_PATH } from "@/lib/routes";

/** @deprecated Use `/competitor-watch` — kept for bookmarks and external links. */
export default function NewsBridgeRedirect() {
  redirect(COMPETITOR_WATCH_PATH);
}
