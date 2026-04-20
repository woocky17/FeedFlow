export interface EmailSender {
  send(recipient: string, subject: string, content: string): Promise<void>;
}
