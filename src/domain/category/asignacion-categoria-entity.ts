export type AssignmentOrigin = "auto" | "manual";

export interface CategoryAssignmentProps {
  articleId: string;
  categoryId: string;
  userId: string;
  origin: AssignmentOrigin;
  assignedAt: Date;
}

export class CategoryAssignment {
  readonly articleId: string;
  readonly categoryId: string;
  readonly userId: string;
  readonly origin: AssignmentOrigin;
  readonly assignedAt: Date;

  private constructor(props: CategoryAssignmentProps) {
    this.articleId = props.articleId;
    this.categoryId = props.categoryId;
    this.userId = props.userId;
    this.origin = props.origin;
    this.assignedAt = props.assignedAt;
  }

  static create(props: CategoryAssignmentProps): CategoryAssignment {
    return new CategoryAssignment(props);
  }

  canBeOverriddenBy(newOrigin: AssignmentOrigin): boolean {
    if (this.origin === "manual" && newOrigin === "auto") {
      return false;
    }
    return true;
  }
}
