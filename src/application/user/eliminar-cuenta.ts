import { UsuarioRepository } from "@/domain/user";
import { FavoritoRepository } from "@/domain/favorite";
import { NotificacionRepository } from "@/domain/notification";
import { CategoriaRepository } from "@/domain/category";

interface EliminarCuentaInput {
  userId: string;
}

export class EliminarCuenta {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly favoritoRepository: FavoritoRepository,
    private readonly notificacionRepository: NotificacionRepository,
    private readonly categoriaRepository: CategoriaRepository,
  ) {}

  async execute(input: EliminarCuentaInput): Promise<void> {
    const user = await this.usuarioRepository.obtener(input.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const favoritos = await this.favoritoRepository.obtenerPorUsuario(input.userId);
    for (const fav of favoritos) {
      await this.favoritoRepository.eliminar(fav.id);
    }

    const notificaciones = await this.notificacionRepository.obtenerPorUsuario(input.userId);
    for (const notif of notificaciones) {
      await this.notificacionRepository.eliminar(notif.id);
    }

    const categorias = await this.categoriaRepository.obtenerPorUsuario(input.userId);
    for (const cat of categorias) {
      await this.categoriaRepository.eliminar(cat.id);
    }

    await this.usuarioRepository.eliminar(input.userId);
  }
}
