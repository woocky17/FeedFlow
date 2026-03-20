export type CategoriaType = "default" | "custom";

export interface CategoriaProps {
  id: string;
  name: string;
  type: CategoriaType;
  userId: string | null;
  createdAt: Date;
}

export class Categoria {
  readonly id: string;
  readonly name: string;
  readonly type: CategoriaType;
  readonly userId: string | null;
  readonly createdAt: Date;

  private constructor(props: CategoriaProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.userId = props.userId;
    this.createdAt = props.createdAt;
  }

  static create(props: CategoriaProps): Categoria {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Categoria name cannot be empty");
    }

    if (props.type === "default" && props.userId !== null) {
      throw new Error("Default categories must not have a userId");
    }

    if (props.type === "custom" && !props.userId) {
      throw new Error("Custom categories must have a userId");
    }

    return new Categoria(props);
  }
}
