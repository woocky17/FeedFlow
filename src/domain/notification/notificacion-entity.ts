export interface NotificationProps {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export class Notification {
  readonly id: string;
  readonly userId: string;
  readonly message: string;
  readonly read: boolean;
  readonly createdAt: Date;

  private constructor(props: NotificationProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.message = props.message;
    this.read = props.read;
    this.createdAt = props.createdAt;
  }

  static create(props: NotificationProps): Notification {
    if (!props.message || props.message.trim().length === 0) {
      throw new Error("Notification message cannot be empty");
    }

    return new Notification(props);
  }
}
