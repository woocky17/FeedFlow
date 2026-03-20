export interface SourceProps {
  id: string;
  name: string;
  baseUrl: string;
  active: boolean;
  createdAt: Date;
}

export class Source {
  readonly id: string;
  readonly name: string;
  readonly baseUrl: string;
  readonly active: boolean;
  readonly createdAt: Date;

  private constructor(props: SourceProps) {
    this.id = props.id;
    this.name = props.name;
    this.baseUrl = props.baseUrl;
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
