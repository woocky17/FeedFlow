import { EmailSender } from "@/domain/notification";

interface ResendSendPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export class ResendEmailAdapter implements EmailSender {
  private readonly baseUrl = "https://api.resend.com/emails";

  constructor(
    private readonly apiKey: string,
    private readonly fromAddress: string = "FeedFlow <noreply@feedflow.app>",
  ) {}

  async enviar(
    recipient: string,
    subject: string,
    content: string,
  ): Promise<void> {
    const payload: ResendSendPayload = {
      from: this.fromAddress,
      to: recipient,
      subject,
      html: content,
    };

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error (${response.status}): ${error}`);
    }
  }
}
