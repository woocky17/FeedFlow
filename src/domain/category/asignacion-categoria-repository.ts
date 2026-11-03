import { CategoryAssignment } from "./asignacion-categoria-entity";

export interface CategoryAssignmentRepository {
  create(assignment: CategoryAssignment): Promise<void>;
}
