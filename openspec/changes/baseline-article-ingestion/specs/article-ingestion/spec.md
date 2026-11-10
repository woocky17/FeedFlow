# Spec Delta

## Purpose

Obtener artículos de las fuentes activas (feeds RSS/Atom y WorldNewsAPI), de forma periódica o bajo demanda, guardarlos sin duplicados y completar después el enriquecimiento que les falte. La clasificación por categorías, las notificaciones y la gestión de fuentes se especifican en sus propias capabilities.

## ADDED Requirements

### Requirement: Sincronización periódica de fuentes activas
El sistema SHALL ejecutar en segundo plano, de forma periódica, una sincronización que recorre solo las fuentes activas y guarda sus artículos nuevos. El intervalo SHALL ser configurable y valer 7200 segundos por defecto. Tras cada sincronización, en la misma ejecución, el sistema SHALL lanzar la reparación de artículos incompletos.

#### Scenario: Solo se consultan las fuentes activas
- **WHEN** se ejecuta la sincronización y hay una fuente activa y otra inactiva
- **THEN** el sistema pide artículos solo a la fuente activa

#### Scenario: Reparación tras la sincronización
- **WHEN** termina la sincronización periódica
- **THEN** el sistema ejecuta la reparación de artículos incompletos e informa del número de artículos nuevos, del número de errores y del resultado de la reparación

### Requirement: Enrutado por tipo de fuente
El sistema SHALL obtener los artículos de cada fuente según su tipo: las fuentes de tipo RSS se leen descargando y parseando su feed público (RSS 2.0 o Atom) y las de tipo WorldNews se consultan en WorldNewsAPI con la clave de API de la fuente, filtrando por el dominio de la fuente y su idioma. Por defecto se piden como mucho 20 artículos por fuente.

#### Scenario: Fuente RSS
- **WHEN** se sincroniza una fuente de tipo RSS
- **THEN** el sistema descarga la URL de la fuente y extrae los items del feed, sin usar ninguna clave de API

#### Scenario: Fuente WorldNews sin clave
- **WHEN** se sincroniza una fuente de tipo WorldNews que no tiene clave de API
- **THEN** la obtención de esa fuente falla y el error queda registrado en el resultado de la sincronización

### Requirement: Deduplicación por URL
El sistema MUST guardar cada artículo una sola vez, identificado por su URL: un artículo cuya URL ya existe no se vuelve a guardar ni a enriquecer. La URL de un artículo SHALL ser única en el almacenamiento.

#### Scenario: Artículo ya conocido
- **WHEN** una fuente devuelve un artículo con una URL que ya está guardada
- **THEN** el sistema lo ignora y no lo cuenta como ingerido

#### Scenario: Artículo nuevo
- **WHEN** una fuente devuelve un artículo con una URL que no existe
- **THEN** el sistema lo guarda, lo enriquece y lo cuenta como ingerido

### Requirement: Lectura tolerante de feeds RSS/Atom
El sistema SHALL procesar cada item de un feed de forma independiente: un item mal formado o que no supere la validación MUST descartarse sin impedir que se guarden los demás items de la misma fuente. Los items sin título o sin enlace, o con una URL no válida, SHALL descartarse. Los campos de texto que el feed entregue con atributos (por ejemplo `type="html"`) o como números SHALL leerse como texto.

#### Scenario: Un item inválido entre items válidos
- **WHEN** un feed contiene un item sin enlace y varios items correctos
- **THEN** el sistema descarta el item sin enlace y devuelve los demás

#### Scenario: Título con atributos
- **WHEN** un item de un feed Atom tiene `<title type="html">Texto</title>`
- **THEN** el artículo se guarda con el título «Texto»

#### Scenario: Fecha ausente o ilegible
- **WHEN** un item no tiene fecha de publicación o la que trae no es una fecha válida
- **THEN** el artículo toma como fecha de publicación el momento de la lectura

#### Scenario: Descripción con HTML
- **WHEN** la descripción de un item contiene etiquetas HTML y entidades como `&amp;`
- **THEN** el artículo se guarda con la descripción en texto plano, sin etiquetas y con las entidades básicas decodificadas

### Requirement: Aislamiento de fallos por fuente
Un fallo al obtener los artículos de una fuente, salvo la cuota agotada de WorldNewsAPI, SHALL registrarse como error en el resultado de la sincronización sin interrumpir el procesamiento de las demás fuentes. Cuando WorldNewsAPI indique que la cuota diaria está agotada (HTTP 402), el sistema SHALL registrar el motivo y MUST NOT hacer más peticiones a WorldNewsAPI durante el resto de esa ejecución.

#### Scenario: Feed caído
- **WHEN** el feed de una fuente RSS responde con un estado HTTP de error
- **THEN** el sistema registra el error de esa fuente y continúa con las siguientes

#### Scenario: Cuota de WorldNewsAPI agotada
- **WHEN** WorldNewsAPI responde 402 para una fuente
- **THEN** el sistema registra que la cuota está agotada y no hace más peticiones a WorldNewsAPI en esa ejecución

### Requirement: Enriquecimiento que no bloquea la ingesta
Una vez guardado un artículo nuevo, el sistema SHALL enriquecerlo (agrupación en evento, emparejamiento con historias seguidas y análisis de sentimiento). Un fallo en cualquiera de esos pasos MUST quedar registrado como error sin deshacer el guardado del artículo ni impedir los pasos siguientes.

#### Scenario: Falla la agrupación en evento
- **WHEN** la agrupación en evento de un artículo nuevo lanza un error
- **THEN** el artículo queda guardado, el error aparece en el resultado y el sistema sigue con el emparejamiento de historias y el sentimiento

### Requirement: Reparación de artículos incompletos
El sistema SHALL revisar los artículos guardados en los últimos 7 días y completar los que no tengan categoría, evento o sentimiento. En cada ejecución SHALL procesar como mucho 50 artículos sin categoría, 100 sin evento (los publicados antes primero) y 40 sin sentimiento, y SHALL informar de cuántos ha clasificado, agrupado, analizado y omitido.

#### Scenario: Artículo reciente sin evento
- **WHEN** hay un artículo guardado hace 2 días que no pertenece a ningún evento
- **THEN** la reparación lo agrupa en un evento y lo cuenta como agrupado

#### Scenario: Artículo antiguo
- **WHEN** un artículo sin sentimiento se guardó hace 10 días
- **THEN** la reparación no lo procesa

#### Scenario: Más pendientes que el límite
- **WHEN** hay 60 artículos recientes sin sentimiento
- **THEN** la reparación analiza como mucho 40 en esa ejecución

### Requirement: Autorización del backfill manual
El sistema SHALL ofrecer un endpoint `POST /api/cron/backfill` para traer artículos históricos bajo demanda. MUST rechazar con 401 cualquier petición cuya cabecera `Authorization` no sea `Bearer` seguida del secreto de cron configurado.

#### Scenario: Sin secreto
- **WHEN** se llama al backfill sin cabecera `Authorization` o con un secreto incorrecto
- **THEN** el sistema responde 401 con `{ "error": "Unauthorized" }` y no consulta ninguna fuente

### Requirement: Rango de días del backfill
El backfill SHALL aceptar en el cuerpo un `daysBack` opcional y acotarlo a `[1, BACKFILL_MAX_DAYS]` (3 por defecto) tras redondearlo hacia abajo; si falta, SHALL usar el máximo. El periodo se recorre en ventanas de 24 horas, pidiendo como mucho 100 artículos por fuente y ventana. La respuesta SHALL incluir `daysBack` aplicado, `fetched`, `ingested` y `errors`.

#### Scenario: Valor por encima del máximo
- **WHEN** se pide `daysBack: 10` con el máximo en 3
- **THEN** el backfill cubre 3 días y la respuesta lleva `daysBack: 3`

#### Scenario: Valor por debajo del mínimo
- **WHEN** se pide `daysBack: 0`
- **THEN** el backfill cubre 1 día

#### Scenario: Cuerpo vacío
- **WHEN** se llama al backfill sin cuerpo
- **THEN** el backfill cubre el máximo de días configurado sobre todas las fuentes activas

### Requirement: Selección de fuentes del backfill
El backfill SHALL aceptar un `sourceIds` opcional. Si es una lista no vacía, SHALL limitarse a las fuentes activas cuyo id esté en la lista; si falta o está vacía, SHALL usar todas las fuentes activas. Si no queda ninguna fuente, SHALL responder sin consultar nada e incluir el error en `errors`.

#### Scenario: Fuente inactiva en la lista
- **WHEN** `sourceIds` solo contiene el id de una fuente inactiva
- **THEN** el backfill no consulta ninguna fuente y `errors` incluye que no hay fuentes activas que procesar

#### Scenario: Lista con fuentes activas
- **WHEN** `sourceIds` contiene dos ids de fuentes activas
- **THEN** el backfill consulta solo esas dos fuentes
