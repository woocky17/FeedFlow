import { Notification } from "@/domain/notification";
import { NotificationRepository, EmailSender } from "@/domain/notification";
import { ArticleRepository } from "@/domain/article";
import { CategoryRepository } from "@/domain/category";
import { UserRepository } from "@/domain/user";

export class SendNotifications {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly articleRepository: ArticleRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly emailSender: EmailSender,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) return;

    const categories = await this.categoryRepository.findByUser(userId);

    for (const category of categories) {
      const articles = await this.articleRepository.findByCategory(category.id);

      for (const article of articles) {
        const notification = Notification.create({
          id: crypto.randomUUID(),
          userId,
          message: `New article in ${category.name}: ${article.title}`,
          read: false,
          createdAt: new Date(),
        });

        await this.notificationRepository.add(notification);

        await this.emailSender.send(
          user.email,
          `New article: ${article.title}`,
          `A new article was published in ${category.name}: ${article.title}`,
        );
      }
    }
  }
}
