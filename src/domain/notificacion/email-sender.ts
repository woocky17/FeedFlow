export interface EmailSender {
  enviar(destinatario: string, asunto: string, contenido: string): Promise<void>;
}
