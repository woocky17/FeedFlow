export interface NotificacionProps {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export class Notificacion {
  readonly id: string;
  readonly userId: string;
  readonly message: string;
  readonly read: boolean;
  readonly createdAt: Date;

  private constructor(props: NotificacionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.message = props.message;
    this.read = props.read;
    this.createdAt = props.createdAt;
  }

  static create(props: NotificacionProps): Notificacion {
    if (!props.message || props.message.trim().length === 0) {
      throw new Error("Notificacion message cannot be empty");
    }

    return new Notificacion(props);
  }
}
