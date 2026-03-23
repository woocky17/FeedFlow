export type CategoryType = "default" | "custom";

export interface CategoryProps {
  id: string;
  name: string;
  type: CategoryType;
  userId: string | null;
  createdAt: Date;
}

export class Category {
  readonly id: string;
  readonly name: string;
  readonly type: CategoryType;
  readonly userId: string | null;
  readonly createdAt: Date;

  private constructor(props: CategoryProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.userId = props.userId;
    this.createdAt = props.createdAt;
  }

  static create(props: CategoryProps): Category {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Category name cannot be empty");
    }

    if (props.type === "default" && props.userId !== null) {
      throw new Error("Default categories must not have a userId");
    }

    if (props.type === "custom" && !props.userId) {
      throw new Error("Custom categories must have a userId");
    }

    return new Category(props);
  }
}
