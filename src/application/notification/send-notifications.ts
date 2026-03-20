import { Notificacion } from "@/domain/notification";
import { NotificacionRepository, EmailSender } from "@/domain/notification";
import { NoticiaRepository } from "@/domain/article";
import { CategoriaRepository } from "@/domain/category";
import { UsuarioRepository } from "@/domain/user";

export class SendNotifications {
  constructor(
    private readonly userRepository: UsuarioRepository,
    private readonly categoryRepository: CategoriaRepository,
    private readonly articleRepository: NoticiaRepository,
    private readonly notificationRepository: NotificacionRepository,
    private readonly emailSender: EmailSender,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.obtener(userId);
    if (!user) return;

    const categories = await this.categoryRepository.obtenerPorUsuario(userId);

    for (const category of categories) {
      const articles = await this.articleRepository.obtenerPorCategoria(category.id);

      for (const article of articles) {
        const notification = Notificacion.create({
          id: crypto.randomUUID(),
          userId,
          message: `New article in ${category.name}: ${article.title}`,
          read: false,
          createdAt: new Date(),
        });

        await this.notificationRepository.anadir(notification);

        await this.emailSender.enviar(
          user.email,
          `New article: ${article.title}`,
          `A new article was published in ${category.name}: ${article.title}`,
        );
      }
    }
  }
}
