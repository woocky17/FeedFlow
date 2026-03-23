import { CategoryAssignment, AssignmentOrigin } from "./asignacion-categoria-entity";

export interface CategoryAssignmentRepository {
  create(assignment: CategoryAssignment): Promise<void>;
  findByArticle(articleId: string): Promise<CategoryAssignment[]>;
  updateOrigin(articleId: string, categoryId: string, origin: AssignmentOrigin): Promise<void>;
}
