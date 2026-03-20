# 📰 Agregador de Noticias Personalizado
> Proyecto Next.js con Arquitectura Hexagonal

---

## 🗂️ Índice
1. [Dominio](#1-dominio)
2. [Aplicación — Casos de Uso](#2-aplicación--casos-de-uso)
3. [Infraestructura — Adaptadores](#3-infraestructura--adaptadores)
4. [App — Next.js](#4-app--nextjs)
5. [Transversal](#5-transversal)

---

## Estructura de carpetas objetivo

```
src/
├── domain/
│   ├── usuario/
│   ├── noticia/
│   ├── categoria/
│   ├── favorito/
│   ├── notificacion/
│   └── fuente/
├── application/
│   ├── usuario/
│   ├── noticia/
│   ├── categoria/
│   ├── favorito/
│   ├── notificacion/
│   └── fuente/
├── infrastructure/
│   ├── db/prisma/
│   ├── email/resend/
│   └── noticias/newsapi/
└── app/
    ├── api/
    └── (pages)/
```

---

## 1. Dominio

> TypeScript puro. Sin frameworks ni librerías externas. Es el núcleo de la app.

### 1.1 Entidad: Usuario
- [ ] Crear clase/tipo `Usuario` con propiedades: `id`, `email`, `passwordHash`, `rol` (`user` | `admin`), `creadoEn`
- [ ] Validar que `email` no puede estar vacío
- [ ] Validar que `email` debe tener formato válido
- [ ] Validar que `passwordHash` no puede estar vacío

### 1.2 Entidad: Fuente
- [ ] Crear clase/tipo `Fuente` con propiedades: `id`, `nombre`, `urlBase`, `activa`, `creadoEn`
- [ ] Validar que `urlBase` debe ser una URL válida
- [ ] Validar que `nombre` no puede estar vacío

### 1.3 Entidad: Noticia
- [ ] Crear clase/tipo `Noticia` con propiedades: `id`, `titulo`, `url`, `descripcion`, `imagen`, `fuenteId`, `publicadaEn`, `guardadaEn`
- [ ] Validar que `titulo` no puede estar vacío
- [ ] Validar que `url` no puede estar vacía
- [ ] Validar que `url` debe tener formato válido

### 1.4 Entidad: Categoría
- [ ] Crear clase/tipo `Categoria` con propiedades: `id`, `nombre`, `tipo` (`default` | `personalizada`), `usuarioId` (null si es default), `creadaEn`
- [ ] Validar que `nombre` no puede estar vacío
- [ ] Validar que las categorías `default` no tienen `usuarioId`
- [ ] Validar que las categorías `personalizadas` requieren `usuarioId`

### 1.5 Entidad: AsignacionCategoria
- [ ] Crear clase/tipo `AsignacionCategoria` con propiedades: `noticiaId`, `categoriaId`, `usuarioId`, `origen` (`automatico` | `manual`), `asignadaEn`
- [ ] Regla: si el `origen` es `manual`, no puede ser sobreescrita por asignaciones automáticas

### 1.6 Entidad: Favorito
- [ ] Crear clase/tipo `Favorito` con propiedades: `id`, `usuarioId`, `noticiaId`, `creadoEn`
- [ ] Validar que un usuario no puede tener dos favoritos con la misma `noticiaId`

### 1.7 Entidad: Notificación
- [ ] Crear clase/tipo `Notificacion` con propiedades: `id`, `usuarioId`, `mensaje`, `leida`, `creadaEn`
- [ ] Validar que `mensaje` no puede estar vacío

### 1.8 Puertos de salida (interfaces)
- [ ] Definir interfaz `UsuarioRepository`: `guardar`, `obtener`, `obtenerPorEmail`, `eliminar`, `actualizarPassword`
- [ ] Definir interfaz `NoticiaRepository`: `guardar`, `obtenerPorCategoria`, `obtenerPorFuente`, `existePorUrl`
- [ ] Definir interfaz `CategoriaRepository`: `crear`, `actualizar`, `obtener`, `obtenerPorUsuario`, `eliminar`
- [ ] Definir interfaz `AsignacionCategoriaRepository`: `crear`, `obtenerPorNoticia`, `actualizarOrigen`
- [ ] Definir interfaz `FavoritoRepository`: `añadir`, `obtenerPorUsuario`, `eliminar`
- [ ] Definir interfaz `NotificacionRepository`: `añadir`, `obtenerPorUsuario`, `marcarComoLeida`, `eliminar`
- [ ] Definir interfaz `FuenteRepository`: `añadir`, `actualizar`, `obtener`, `obtenerActivas`, `eliminar`
- [ ] Definir interfaz `NoticiasFetcher`: `fetchPorFuente(fuente: Fuente): Promise<Noticia[]>`
- [ ] Definir interfaz `EmailSender`: `enviar(destinatario, asunto, contenido)`

---

## 2. Aplicación — Casos de Uso

> Orquestan el dominio usando los puertos. Sin dependencias de frameworks.

### 2.1 Usuario anónimo
- [ ] Caso de uso: `RegistrarUsuario` — valida email único, hashea password, guarda
- [ ] Caso de uso: `IniciarSesion` — busca por email, valida password, devuelve token
- [ ] Caso de uso: `RecuperarPassword` — genera token, envía email con `EmailSender`

### 2.2 Usuario autenticado
- [ ] Caso de uso: `EliminarCuenta` — elimina usuario y todos sus datos asociados
- [ ] Caso de uso: `LeerNoticias` — obtiene noticias filtradas por categoría y/o fuente
- [ ] Caso de uso: `BuscarNoticiasConIA` — usa un servicio de IA para búsqueda semántica
- [ ] Caso de uso: `CrearCategoriaPersonalizada` — valida nombre único por usuario, crea
- [ ] Caso de uso: `EditarCategoriaPersonalizada` — valida pertenencia al usuario, actualiza
- [ ] Caso de uso: `EliminarCategoriaPersonalizada` — valida pertenencia, elimina (no elimina noticias)
- [ ] Caso de uso: `AsignarCategoriaManualmente` — crea/actualiza `AsignacionCategoria` con origen `manual`
- [ ] Caso de uso: `AñadirFavorito` — valida que no existe ya, crea favorito
- [ ] Caso de uso: `EliminarFavorito` — valida pertenencia al usuario, elimina
- [ ] Caso de uso: `VerFavoritos` — obtiene favoritos del usuario con datos de noticia
- [ ] Caso de uso: `ActivarDesactivarFuente` — el usuario elige qué fuentes activa para su feed
- [ ] Caso de uso: `MarcarNotificacionLeida` — actualiza estado de notificación

### 2.3 Administrador
- [ ] Caso de uso: `AñadirFuente` — valida URL válida, crea fuente
- [ ] Caso de uso: `EditarFuente` — actualiza URL o nombre de fuente
- [ ] Caso de uso: `EliminarFuente` — elimina fuente
- [ ] Caso de uso: `GestionarCategoriasDefault` — CRUD de categorías globales

### 2.4 Sistema (procesos automáticos)
- [ ] Caso de uso: `SincronizarNoticias` — itera fuentes activas, llama `fetchPorFuente`, guarda nuevas, si falla una continúa con la siguiente, asigna categorías automáticamente
- [ ] Caso de uso: `EnviarNotificaciones` — detecta noticias nuevas por categoría de usuario, crea notificaciones, envía emails

---

## 3. Infraestructura — Adaptadores

> Implementaciones concretas de los puertos. Aquí vive la tecnología.

### 3.1 Base de datos — Prisma
- [ ] Configurar Prisma con PostgreSQL (o SQLite para desarrollo local)
- [ ] Definir schema: `Usuario`, `Noticia`, `Categoria`, `AsignacionCategoria`, `Favorito`, `Notificacion`, `Fuente`
- [ ] Implementar `PrismaUsuarioRepository`
- [ ] Implementar `PrismaNoticiaRepository`
- [ ] Implementar `PrismaCategoriaRepository`
- [ ] Implementar `PrismaAsignacionCategoriaRepository`
- [ ] Implementar `PrismaFavoritoRepository`
- [ ] Implementar `PrismaNotificacionRepository`
- [ ] Implementar `PrismaFuenteRepository`
- [ ] Crear seeds para categorías default (Política, Deportes, Tecnología, etc.)

### 3.2 Noticias externas — NewsAPI
- [ ] Crear cuenta gratuita en NewsAPI
- [ ] Implementar `NewsApiAdapter` que implementa `NoticiasFetcher`
- [ ] Mapear respuesta de NewsAPI al tipo `Noticia` del dominio
- [ ] Gestionar errores y rate limits

### 3.3 Email — Resend
- [ ] Crear cuenta gratuita en Resend
- [ ] Implementar `ResendEmailAdapter` que implementa `EmailSender`
- [ ] Crear plantilla de email para notificaciones
- [ ] Crear plantilla de email para recuperación de password

---

## 4. App — Next.js

> Solo recibe peticiones y delega en los casos de uso. Sin lógica de negocio aquí.

### 4.1 Autenticación
- [ ] Configurar NextAuth.js con credenciales (email + password)
- [ ] Proteger rutas privadas con middleware
- [ ] Implementar página de login
- [ ] Implementar página de registro
- [ ] Implementar página de recuperación de password

### 4.2 API Routes
- [ ] `POST /api/auth/register` → `RegistrarUsuario`
- [ ] `GET /api/noticias` → `LeerNoticias`
- [ ] `POST /api/categorias` → `CrearCategoriaPersonalizada`
- [ ] `PUT /api/categorias/:id` → `EditarCategoriaPersonalizada`
- [ ] `DELETE /api/categorias/:id` → `EliminarCategoriaPersonalizada`
- [ ] `POST /api/favoritos` → `AñadirFavorito`
- [ ] `DELETE /api/favoritos/:id` → `EliminarFavorito`
- [ ] `GET /api/favoritos` → `VerFavoritos`
- [ ] `PUT /api/notificaciones/:id/leer` → `MarcarNotificacionLeida`
- [ ] `POST /api/admin/fuentes` → `AñadirFuente` (solo admin)
- [ ] `PUT /api/admin/fuentes/:id` → `EditarFuente` (solo admin)
- [ ] `DELETE /api/admin/fuentes/:id` → `EliminarFuente` (solo admin)

### 4.3 Páginas
- [ ] Página principal — feed de noticias con filtros por categoría
- [ ] Página de favoritos
- [ ] Página de categorías personalizadas
- [ ] Página de configuración de fuentes
- [ ] Página de notificaciones
- [ ] Panel de administración (gestión de fuentes y categorías default)

### 4.4 Sincronización automática
- [ ] Configurar cron job con `next-cron` o Vercel Cron para ejecutar `SincronizarNoticias`
- [ ] Configurar cron job para ejecutar `EnviarNotificaciones`

---

## 5. Transversal

### 5.1 Testing
- [ ] Tests unitarios para cada entidad del dominio
- [ ] Tests unitarios para cada caso de uso (usando mocks de los puertos)
- [ ] Tests de integración para los adaptadores de Prisma

### 5.2 Configuración del proyecto
- [ ] Inicializar proyecto Next.js con TypeScript
- [ ] Configurar ESLint y Prettier
- [ ] Configurar variables de entorno (`.env.example`)
- [ ] Configurar paths de TypeScript para importaciones limpias (`@/domain`, `@/application`, etc.)

---

## 📋 Orden recomendado de desarrollo

```
1. Setup del proyecto (5.2)
2. Dominio — entidades y puertos (1.1 → 1.8)
3. Tests del dominio (5.1)
4. Casos de uso (2.1 → 2.4)
5. Tests de casos de uso con mocks (5.1)
6. Schema de Prisma (3.1)
7. Adaptadores de Prisma (3.1)
8. Adaptador NewsAPI (3.2)
9. Adaptador Resend (3.3)
10. Autenticación Next.js (4.1)
11. API Routes (4.2)
12. Páginas (4.3)
13. Cron jobs (4.4)
```

---

> 💡 **Regla de oro**: si en algún momento escribes el nombre de `prisma`, `newsapi`, `resend` o `next` dentro de la carpeta `domain/`, algo está mal. El dominio no conoce a nadie.
