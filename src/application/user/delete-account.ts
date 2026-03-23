import { UserRepository } from "@/domain/user";
import { FavoriteRepository } from "@/domain/favorite";
import { NotificationRepository } from "@/domain/notification";
import { CategoryRepository } from "@/domain/category";

interface DeleteAccountInput {
  userId: string;
}

export class DeleteAccount {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly favoriteRepository: FavoriteRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(input: DeleteAccountInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const favorites = await this.favoriteRepository.findByUser(input.userId);
    for (const fav of favorites) {
      await this.favoriteRepository.delete(fav.id);
    }

    const notifications = await this.notificationRepository.findByUser(input.userId);
    for (const notif of notifications) {
      await this.notificationRepository.delete(notif.id);
    }

    const categories = await this.categoryRepository.findByUser(input.userId);
    for (const cat of categories) {
      await this.categoryRepository.delete(cat.id);
    }

    await this.userRepository.delete(input.userId);
  }
}
