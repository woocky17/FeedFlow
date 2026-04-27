import { isLanguage, type Language } from "@/domain/shared";

export type SourceKind = "worldnews" | "rss";

export interface SourceProps {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  kind: SourceKind;
  language: Language;
  active: boolean;
  createdAt: Date;
}

export class Source {
  readonly id: string;
  readonly name: string;
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly kind: SourceKind;
  readonly language: Language;
  readonly active: boolean;
  readonly createdAt: Date;

  private constructor(props: SourceProps) {
    this.id = props.id;
    this.name = props.name;
    this.baseUrl = props.baseUrl;
    this.apiKey = props.apiKey;
    this.kind = props.kind;
    this.language = props.language;
    this.active = props.active;
    this.createdAt = props.createdAt;
  }

  static create(props: SourceProps): Source {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Source name cannot be empty");
    }

    if (!Source.isValidUrl(props.baseUrl)) {
      throw new Error("Source baseUrl must be a valid URL");
    }

    if (props.kind === "worldnews" && (!props.apiKey || props.apiKey.trim().length === 0)) {
      throw new Error("WorldNews sources require an API key");
    }

    if (!isLanguage(props.language)) {
      throw new Error("Source language must be a supported language");
    }

    return new Source(props);
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
