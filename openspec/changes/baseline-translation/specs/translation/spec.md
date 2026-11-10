# Spec Delta

## Purpose

Mostrar la interfaz en el idioma del usuario (español o inglés) y ofrecer los artículos traducidos a ese idioma: traducción bajo demanda de un artículo, traducción anticipada de los títulos recientes en segundo plano y presentación de las traducciones guardadas en el feed. Cómo la sesión guarda el idioma está en `auth` y el resto del feed en `article-feed`.

## ADDED Requirements

### Requirement: Idioma de la interfaz
Los idiomas soportados SHALL ser `es` y `en`. El idioma de la interfaz SHALL resolverse en este orden: el idioma de la sesión si hay sesión; si no, el valor de la cookie `NEXT_LOCALE` si es un idioma soportado; si no, `es`.

#### Scenario: Usuario con sesión
- **WHEN** un usuario con idioma `en` en su sesión abre la aplicación con la cookie `NEXT_LOCALE=es`
- **THEN** la interfaz se muestra en inglés

#### Scenario: Visitante con cookie
- **WHEN** alguien sin sesión abre la aplicación con la cookie `NEXT_LOCALE=en`
- **THEN** la interfaz se muestra en inglés

#### Scenario: Sin sesión ni cookie válida
- **WHEN** alguien sin sesión abre la aplicación sin cookie o con `NEXT_LOCALE=fr`
- **THEN** la interfaz se muestra en español

### Requirement: Cambio de idioma
El selector de idioma, presente en la cabecera de las páginas y en `/settings`, SHALL guardar el idioma elegido en la cookie `NEXT_LOCALE` durante un año y volver a mostrar la interfaz en ese idioma. Si hay sesión, SHALL guardar además el idioma en el perfil del usuario y actualizar su sesión. Un idioma no soportado MUST ignorarse sin cambiar nada. La página `/settings` SHALL redirigir a `/login` a quien entre sin sesión.

#### Scenario: Cambio con sesión
- **WHEN** un usuario con sesión elige `en` en el selector
- **THEN** la cookie `NEXT_LOCALE` pasa a `en`, su perfil y su sesión pasan a idioma `en` y la interfaz se muestra en inglés

#### Scenario: Cambio sin sesión
- **WHEN** alguien sin sesión elige `en` en el selector
- **THEN** la cookie `NEXT_LOCALE` pasa a `en` y la interfaz se muestra en inglés

#### Scenario: Ajustes sin sesión
- **WHEN** alguien sin sesión abre `/settings`
- **THEN** se le redirige a `/login`

### Requirement: Traducción de un artículo bajo demanda
`GET /api/articles/{id}/translation` SHALL devolver el artículo en el idioma de `targetLang` o, si falta o no es soportado, en el de la sesión y, sin sesión, en `es`. La respuesta SHALL incluir `id`, `original` y `displayed` (con `title` y `description`), `displayedLanguage`, `sourceLanguage`, `isTranslated` y `translationFailed`. Un artículo ya en el idioma pedido SHALL devolverse sin traducir.

#### Scenario: Artículo en inglés pedido en español
- **WHEN** se pide en `es` un artículo en inglés
- **THEN** la respuesta lleva el título y la descripción traducidos en `displayed`, los originales en `original`, `displayedLanguage: "es"`, `sourceLanguage: "en"` e `isTranslated: true`

#### Scenario: Mismo idioma
- **WHEN** se pide en `es` un artículo que ya está en español
- **THEN** la respuesta lleva el texto original en `displayed` e `isTranslated: false`, sin llamar al servicio de traducción

### Requirement: Traducción bajo demanda sin servicio configurado
Si el servicio de traducción (Groq) no está configurado, la traducción bajo demanda MUST responder 503 con `{ "error": "Translation service is not configured" }`.

#### Scenario: Servicio no configurado
- **WHEN** se pide una traducción y no hay clave de Groq configurada
- **THEN** el sistema responde 503 con `{ "error": "Translation service is not configured" }`

### Requirement: Reutilización de traducciones guardadas
Cada traducción obtenida bajo demanda SHALL guardarse por artículo e idioma. Si ya existe una traducción completa (con título y descripción) del artículo en el idioma pedido, el sistema SHALL devolverla sin volver a llamar al servicio de traducción. Si solo existe el título traducido, SHALL reutilizarlo, traducir únicamente la descripción y guardar la traducción completa.

#### Scenario: Traducción completa guardada
- **WHEN** se pide en `es` un artículo cuya traducción completa al español ya está guardada
- **THEN** se devuelve la traducción guardada sin llamar al servicio de traducción

#### Scenario: Solo el título guardado
- **WHEN** se pide en `es` un artículo del que solo se guardó el título traducido
- **THEN** se reutiliza ese título, se traduce solo la descripción y queda guardada la traducción completa

### Requirement: Fallo de traducción sin error para el cliente
Si la traducción falla, el endpoint SHALL responder igualmente con éxito, con el texto original en `displayed`, `displayedLanguage` igual al idioma del artículo y `translationFailed: true`.

#### Scenario: El servicio de traducción falla
- **WHEN** el servicio de traducción devuelve un error al traducir un artículo en inglés pedido en `es`
- **THEN** la respuesta lleva el texto original, `displayedLanguage: "en"` y `translationFailed: true`

### Requirement: Traducción anticipada de títulos
Si el servicio de traducción está configurado, el sistema SHALL ejecutar en segundo plano, cada 600 segundos por defecto (configurable), una tarea que toma los artículos guardados en las últimas 24 horas, como mucho los 200 guardados más recientemente, y traduce su título a cada idioma soportado distinto del suyo, guardándolo sin descripción. Las traducciones que ya existan SHALL omitirse. Sin servicio de traducción, la tarea MUST NOT ejecutarse.

#### Scenario: Artículo reciente en inglés
- **WHEN** se ejecuta la tarea y hay un artículo en inglés guardado hace 2 horas sin traducción
- **THEN** se guarda su título traducido al español, sin descripción

#### Scenario: Traducción ya existente
- **WHEN** el artículo ya tiene traducción al español
- **THEN** la tarea la omite y la cuenta como omitida

#### Scenario: Artículo antiguo
- **WHEN** un artículo se guardó hace 30 horas
- **THEN** la tarea no lo procesa

### Requirement: Fallos aislados en la traducción anticipada
Un fallo al traducir el título de un artículo a un idioma MUST registrarse sin interrumpir el resto de la tarea. El resultado de cada ejecución SHALL informar de cuántos artículos se revisaron y de cuántas traducciones se hicieron, se omitieron y fallaron.

#### Scenario: Falla una traducción
- **WHEN** el servicio de traducción falla con el primero de tres artículos pendientes
- **THEN** la tarea traduce los otros dos y el resultado cuenta 2 traducidas y 1 error

### Requirement: Traducciones guardadas en el feed
Para un usuario con sesión, el feed SHALL mostrar cada artículo escrito en otro idioma con su traducción guardada al idioma de la sesión, si existe: el título traducido y la descripción traducida o, si no la hay, la original. Esos artículos SHALL marcarse como traducidos, con un control para alternar entre traducción y original. Sin traducción guardada, el artículo SHALL mostrarse en su idioma y sin la marca. El feed MUST NOT llamar al servicio de traducción.

#### Scenario: Título traducido por la tarea anticipada
- **WHEN** un usuario con idioma `es` abre el feed y un artículo en inglés solo tiene guardado el título traducido
- **THEN** la tarjeta muestra el título en español, la descripción original y la marca «Traducido»

#### Scenario: Ver el original
- **WHEN** el usuario pulsa «Ver original» en un artículo traducido
- **THEN** la tarjeta pasa a mostrar el título y la descripción originales y el control ofrece «Ver traducción»

#### Scenario: Sin traducción guardada
- **WHEN** un artículo en inglés no tiene traducción al español
- **THEN** el feed de un usuario con idioma `es` lo muestra en inglés y sin la marca de traducido
