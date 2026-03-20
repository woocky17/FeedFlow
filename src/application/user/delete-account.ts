import { UsuarioRepository } from "@/domain/user";
import { FavoritoRepository } from "@/domain/favorite";
import { NotificacionRepository } from "@/domain/notification";
import { CategoriaRepository } from "@/domain/category";

interface DeleteAccountInput {
  userId: string;
}

export class DeleteAccount {
  constructor(
    private readonly userRepository: UsuarioRepository,
    private readonly favoriteRepository: FavoritoRepository,
    private readonly notificationRepository: NotificacionRepository,
    private readonly categoryRepository: CategoriaRepository,
  ) {}

  async execute(input: DeleteAccountInput): Promise<void> {
    const user = await this.userRepository.obtener(input.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const favorites = await this.favoriteRepository.obtenerPorUsuario(input.userId);
    for (const fav of favorites) {
      await this.favoriteRepository.eliminar(fav.id);
    }

    const notifications = await this.notificationRepository.obtenerPorUsuario(input.userId);
    for (const notif of notifications) {
      await this.notificationRepository.eliminar(notif.id);
    }

    const categories = await this.categoryRepository.obtenerPorUsuario(input.userId);
    for (const cat of categories) {
      await this.categoryRepository.eliminar(cat.id);
    }

    await this.userRepository.eliminar(input.userId);
  }
}
