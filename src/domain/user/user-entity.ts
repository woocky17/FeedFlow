export type UserRole = "user" | "admin";

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: UserRole;
  readonly createdAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.createdAt = props.createdAt;
  }

  static create(props: UserProps): User {
    if (!props.email || !User.isValidEmail(props.email)) {
      throw new Error("User email must be a valid email address");
    }

    if (!props.passwordHash || props.passwordHash.trim().length === 0) {
      throw new Error("User passwordHash cannot be empty");
    }

    if (props.role !== "user" && props.role !== "admin") {
      throw new Error("User role must be 'user' or 'admin'");
    }

    return new User(props);
  }

  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
