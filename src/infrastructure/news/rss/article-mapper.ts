import { ArticleProps } from "@/domain/article";
import type { Language } from "@/domain/shared";

export interface RssItem {
  title?: unknown;
  link?:
    | string
    | { "@_href"?: string; "#text"?: string }
    | Array<{ "@_href"?: string; "@_rel"?: string }>;
  description?: unknown;
  summary?: unknown;
  content?: unknown;
  pubDate?: unknown;
  published?: unknown;
  updated?: unknown;
  enclosure?: { "@_url"?: string; "@_type"?: string } | Array<{ "@_url"?: string }>;
  "media:content"?: { "@_url"?: string } | Array<{ "@_url"?: string }>;
  "media:thumbnail"?: { "@_url"?: string };
}

function pickText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return pickText(value[0]);
  if (value && typeof value === "object") {
    return pickText((value as { "#text"?: unknown })["#text"]);
  }
  return "";
}

function pickLink(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const alternate = value.find((l) => l["@_rel"] === "alternate") ?? value[0];
    return alternate?.["@_href"] ?? "";
  }
  if (value && typeof value === "object") {
    const obj = value as { "@_href"?: string; "#text"?: string };
    return obj["@_href"] ?? obj["#text"] ?? "";
  }
  return "";
}

function pickImage(item: RssItem): string {
  if (item.enclosure) {
    if (Array.isArray(item.enclosure)) {
      return item.enclosure[0]?.["@_url"] ?? "";
    }
    if (item.enclosure["@_type"]?.startsWith("image/") || !item.enclosure["@_type"]) {
      return item.enclosure["@_url"] ?? "";
    }
  }
  const mediaContent = item["media:content"];
  if (mediaContent) {
    if (Array.isArray(mediaContent)) return mediaContent[0]?.["@_url"] ?? "";
    return mediaContent["@_url"] ?? "";
  }
  return item["media:thumbnail"]?.["@_url"] ?? "";
}

function pickDate(item: RssItem): Date {
  const raw = pickText(item.pubDate) || pickText(item.published) || pickText(item.updated);
  if (!raw) return new Date();
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date() : d;
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapRssItem(
  item: RssItem,
  sourceId: string,
  language: Language,
): ArticleProps | null {
  const title = pickText(item.title).trim();
  const url = pickLink(item.link).trim();
  if (!title || !url) return null;

  const description = stripHtml(
    pickText(item.description) || pickText(item.summary) || pickText(item.content),
  );
  const publishedAt = pickDate(item);

  return {
    id: crypto.randomUUID(),
    title,
    url,
    description,
    image: pickImage(item),
    sourceId,
    language,
    publishedAt,
    savedAt: new Date(),
  };
}
