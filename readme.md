# Inicio de proyecto


## Creación del proyecto Node

Preparacion del entorno de desarrollo

1. Crear el proyecto en node mediante el comando:
    ```cmd
        npm init -y
    ```

2. Definimos en un archivo **.node-version** la version de node que
   empleara el proyecto.
   ``` cmd
        New-Item .node-version
   ```
3. Escribimos dentro del archivo .node-version la version de node a utilizar.
   ``` plain
        v25.9.0
   ```


## Configuracion de tipado del proyecto

Instalamos como dependencia de desarrollo el compilador oficial de typescript en nuestro proyecto.
   ``` cmd
       npm i --save-dev --save-exact typescript
   ```

Despues instalamos una herramienta dedicada para la etapa de desarrollo, que nos permite poder ejecutar archivos typescript sin necesidad de compilar
el proyecto a Javascript cada vez que haces un cambio y agilizar el tiempo de
desarrollo.

   ``` cmd
       npm i --save-dev --save-exact ts-node
   ```


## Instalacion de tipos especificos para NodeJS.

Como Node.js originalmente está escrito en JavaScript, no tiene tipos de datos integrados. Por lo que debemos instalar el paquete que contiene las definiciones de tipos de TypeScript para la API en tiempo de ejecución de Node

Este paquete nos proporciona el tipado estricto y la documentación estática para los módulos nativos del sistema,  permitiendo al compilador de TypeScript realizar el análisis estático de código y habilitar funciones avanzadas de IntelliSense (autocompletado y detección de errores en tiempo de diseño) en el entorno de desarrollo.


```cmd
    npm i --save-dev --save-exact @types/node
```

## Inicializamos el archivo de configuración del compilador de typescript

Este archivo contiene todas las directivas, reglas de tipado y configuraciones que el compilador (tsc) utilizará para analizar tu código y traducirlo a JavaScript. El archivo se crea preconfigurado con las opciones estándar de la industria y la gran mayoría de las propiedades avanzadas comentadas para que las habilites solo si las necesitas.

```cmd
    npx tsc --init
```

## Soporte de alias de rutas en tiempo de ejecución

Instalamos como dependencia de desarrollo una herramienta que permite a Node.js interpretar y resolver correctamente los alias de rutas personalizados que definamos dentro de la propiedad paths del archivo tsconfig.json.

```cmd
    npm i --save-dev --save-exact tsconfig-paths
```

Este paquete intercepta el sistema nativo de resolución de módulos de Node.js durante la etapa de desarrollo. Al integrarlo con herramientas como ts-node, traduce automáticamente las rutas absolutas simuladas (como @/components/User) a sus ubicaciones físicas reales dentro del disco en tiempo de ejecución, evitando que el motor de Node.js lance errores de "módulo no encontrado" (module not found) y permitiendo prescindir de las importaciones relativas complejas.

## Limpieza automatizada del directorio de compilación

Instalamos como dependencia de desarrollo una herramienta multiplataforma que nos permite eliminar carpetas y archivos de forma rápida y segura antes de cada proceso de compilación.

```cmd
    npm i --save-dev --save-exact rimraf
```

Este paquete emula el comportamiento del comando nativo de Unix rm -rf de manera portátil, garantizando que los scripts de limpieza funcionen de forma idéntica en sistemas operativos Windows, macOS y Linux. Se utiliza principalmente en la automatización de tareas (dentro de los scripts de package.json) para purgar por completo el directorio de salida (como la carpeta dist o build) antes de generar una nueva versión de producción, evitando así que archivos obsoletos o eliminados de compilaciones previas permanezcan en el resultado final.

## Expansión de variables de entorno

Instalamos como dependencia de desarrollo un complemento para dotenv que permite inyectar variables de entorno dentro de otras variables utilizando una sintaxis de interpolación.

```
    npm i --save-dev --save-exact dotenv-expand
```

Este paquete añade una capa de lógica al lector de archivos .env, permitiendo reutilizar valores y construir configuraciones dinámicas basadas en variables previamente declaradas. Por ejemplo, definir: 

``` cmd
    DATABASE_URL=postgres://${DB_USER}:${DB_PASS}@localhost:5432
```

Al automatizar la combinación de valores en tiempo de ejecución, reduce la duplicación de datos en los archivos de configuración y simplifica el mantenimiento de las credenciales del entorno en diferentes etapas del despliegue.


## Validación y consistencia de variables de entorno

Instalamos como dependencia de desarrollo una extensión de seguridad para asegurar que el proyecto contenga todas las variables de entorno obligatorias antes de permitir el arranque de la aplicación.


```cmd
    npm i --save-dev --save-exact dotenv-safe
```

Este paquete compara las variables definidas en el archivo activo .env contra un archivo de plantilla llamado .env.example que actúa como contrato del proyecto. Si al iniciar la aplicación falta alguna de las claves requeridas, el módulo detiene inmediatamente la ejecución lanzando un error específico que detalla los campos ausentes, evitando fallos silenciosos en producción debido a configuraciones incompletas o descuidos durante el despliegue del equipo.


## Gestión multiplataforma de variables de entorno en scripts

Instalamos como dependencia de desarrollo una utilidad para asignar variables de entorno de forma uniforme a través de la terminal, sin importar el sistema operativo del desarrollador.

```cmd
    npm i --save-dev --save-exact cross-env
```

Este paquete actúa como un puente de compatibilidad que unifica la sintaxis de la consola al inyectar variables de entorno directamente en los scripts del package.json (por ejemplo, cross-env NODE_ENV=production ts-node...). Al interceptar el comando, se encarga de aplicar la variable usando la sintaxis correcta del sistema operativo anfitrión —sea Bash en Linux/macOS o PowerShell/CMD en Windows—, garantizando que los scripts de ejecución y compilación sean universales y libres de errores sintácticos para todo el equipo de desarrollo.


# Arquitectura del servidor web y enrutamiento HTTP

Instalamos la infraestructura base para la creación del servidor web, la gestión de peticiones HTTP, el enrutamiento de la aplicación y el manejo de middlewares.

```cmd
    npm i --save-exact express
```

Adicionalmente, instalamos las definiciones de tipos para TypeScript de este framework como una dependencia de desarrollo. Al ser Express una librería nativa de JavaScript, este paquete proporciona al compilador el modelado estricto de los objetos de petición (`Request`), respuesta (`Response`) y ciclo de vida del servidor.

```cmd
    npm i --save-dev --save-exact @types/express
```

Este ecosistema proporciona la abstracción necesaria para montar un servidor HTTP robusto y altamente escalable en Node.js. Al integrarse con el compilador, habilita el autocompletado avanzado y la verificación estática de tipos en los puntos de entrada, controladores y middlewares de las rutas del backend, garantizando la seguridad en el tipado de los datos que fluyen a través de las peticiones de red.

## Control de acceso a recursos de origen cruzado (CORS)

Instalamos el mecanismo de seguridad que permite configurar y restringir los orígenes, métodos y cabeceras autorizados para interactuar con la API del servidor desde clientes externos o navegadores web.

```cmd
    npm i --save-exact cors
```

Adicionalmente, instalamos sus correspondientes definiciones de tipos para TypeScript como una dependencia de desarrollo, asegurando la verificación estática de su configuración.

```cmd
    npm i --save-dev --save-exact @types/cors
```

Este middleware intercepta las peticiones de red para inyectar las cabeceras HTTP de control de acceso necesarias (tales como `Access-Control-Allow-Origin`). Su implementación es indispensable para proteger el backend de solicitudes maliciosas no autorizadas o, por el contrario, para flexibilizar la comunicación de datos cuando el frontend y el backend residen en dominios o puertos completamente independientes en entornos de producción.


## Gestión de cookies en peticiones HTTP

Instalamos la utilidad encargada de capturar, parsear y estructurar las cabeceras de cookies enviadas por el cliente dentro de los flujos de comunicación del servidor.

```cmd
    npm i --save-exact cookie-parser
```

Adicionalmente, incorporamos sus definiciones de tipos correspondientes para TypeScript como una dependencia de desarrollo.

```cmd
    npm i --save-dev --save-exact @types/cookie-parser
```

Este middleware intercepta la petición entrante, procesa la cabecera `Cookie` y expone un objeto formateado en `req.cookies`, permitiendo al backend leer de forma tipada y segura los tokens de sesión o preferencias del usuario. Asimismo, incluye soporte para firmar criptográficamente las cookies mediante una clave secreta (`req.signedCookies`), mitigando la manipulación de datos en el lado del cliente y reforzando la seguridad de las sesiones.


## Optimización y compresión del tráfico de red

Instalamos el componente de optimización encargado de reducir el tamaño de las cargas útiles (payloads) de las respuestas HTTP antes de ser transmitidas a través de la red.

```cmd
    npm i --save-exact compression
```

De igual forma, agregamos sus definiciones de tipos oficiales para TypeScript dentro de las dependencias de desarrollo del proyecto.

```cmd
    npm i --save-dev --save-exact @types/compression
```

Este middleware aplica algoritmos de compresión estándar de la industria (como Gzip o Deflate) sobre los cuerpos de las respuestas (JSON, HTML o activos estáticos) que superen un umbral específico de tamaño. Al disminuir drásticamente el volumen de bytes enviados por el canal de comunicación, reduce de manera significativa la latencia de carga percibida por el cliente y optimiza el consumo de ancho de banda en la infraestructura de servidores.

## Sistema de registro de eventos y rotación de logs de producción

Instalamos la infraestructura de logging empresarial para capturar, formatear y almacenar de manera estructurada los eventos de la aplicación, errores del sistema y auditorías de actividad.

```cmd
    npm i --save-exact winston
```

Adicionalmente, incorporamos el transporte especializado para automatizar la persistencia y la rotación diaria de los archivos de registro en el disco físico.

```cmd
    npm i --save-exact winston-daily-rotate-file
```

Winston proporciona un sistema de logging desacoplado y altamente configurable que supera las limitaciones del comando nativo `console.log`. Permite definir múltiples niveles de severidad (error, warn, info, debug), formatear las salidas en estructuras JSON legibles por máquinas o texto coloreado para la consola de desarrollo, y dirigir los mensajes hacia diferentes destinos en tiempo de ejecución. 

Al integrarse con el plugin de rotación diaria, el backend gestiona de forma autónoma el almacenamiento de logs en producción: fragmenta los archivos por fechas, limita el peso máximo por archivo y purga automáticamente los registros antiguos según una política de retención predefinida (por ejemplo, mantener solo los últimos 14 días), evitando que el servidor agote el espacio en disco debido a un crecimiento descontrolado de los archivos de historial.

## Auditoría y registro de peticiones HTTP en tiempo de ejecución

Instalamos el middleware de auditoría encargado de interceptar y registrar automáticamente en la consola o en el sistema de archivos el historial detallado de todas las solicitudes de red que recibe el servidor.

```cmd
    npm i --save-exact morgan
```


Adicionalmente, instalamos sus definiciones de tipos oficiales para TypeScript como una dependencia de desarrollo del proyecto.

```cmd
    npm i --save-dev --save-exact @types/morgan
```

Este componente actúa como una caja negra de tráfico de red para el backend. Al recibir una petición HTTP, extrae y formatea en una sola línea de texto metadatos críticos de la transacción, tales como el método HTTP utilizado, la ruta URL solicitada, el código de estado de la respuesta (ej. 200, 404, 500), el tiempo de respuesta del servidor en milisegundos y el tamaño del payload enviado. Su integración es fundamental durante la etapa de desarrollo para depurar flujos de datos en tiempo real, y en entornos de producción se acopla con el sistema de logs (como Winston) para mantener una bitácora exhaustiva del rendimiento y accesos a la API.

## Aseguramiento de cabeceras HTTP y mitigación de vulnerabilidades web

Instalamos la suite de seguridad encargada de proteger la infraestructura del servidor mediante la inyección y reconfiguración automatizada de cabeceras HTTP orientadas a la seguridad en el navegador.

```cmd
    npm i --save-exact helmet
```

Este middleware encapsula una colección de sub-middlewares que configuran cabeceras críticas del estándar web para blindar la aplicación contra vectores de ataque comunes. Al activarse, gestiona directivas esenciales como la política de seguridad de contenido (`Content-Security-Policy`) para mitigar ataques de inyección de scripts (XSS), previene el secuestro de clics (`X-Frame-Options`), deshabilita el rastreo de tipos MIME maliciosos (`X-Content-Type-Options`) y oculta la cabecera `X-Powered-By` para evitar el escaneo y reconocimiento del software del backend por parte de atacantes externos, elevando significativamente el umbral de seguridad base de la API con un impacto mínimo en el rendimiento.


## Criptografía y hash seguro de credenciales

Instalamos la solución de seguridad criptográfica encargada del procesamiento, encriptación unidireccional y verificación de contraseñas de usuarios mediante el algoritmo estándar de la industria.

```cmd
    npm i --save-exact argon2
```

Argon2 es el algoritmo de hash de contraseñas ganador del *Password Hashing Competition*, seleccionado por la comunidad internacional como el estándar moderno más seguro y eficiente por encima de alternativas legadas como bcrypt o PBKDF2. Este módulo vincula binarios de rendimiento nativo en el servidor para transformar texto plano en representaciones criptográficas altamente complejas mediante el uso de factores de costo configurables (como memoria, tiempo de CPU y paralelismo de hilos), proporcionando una inmunidad matemática robusta frente a ataques de fuerza bruta y optimizaciones de hardware maliciosas basadas en GPU o ASICs para proteger las bases de datos de accesos no autorizados.

## Autenticación basada en Tokens (JSON Web Tokens)

Instalamos la infraestructura criptográfica para la generación, firma y validación de tokens de acceso compactos y autocontenidos, permitiendo implementar un mecanismo de autenticación sin estado (*stateless*) entre el cliente y la API.

```cmd
    npm i --save-exact jsonwebtoken
```

Adicionalmente, instalamos sus correspondientes definiciones de tipos para TypeScript como una dependencia de desarrollo del proyecto.

```cmd
    npm i --save-dev --save-exact @types/jsonwebtoken
```

Este componente permite establecer una comunicación segura e íntegra de la identidad del usuario a través de la red. Al autenticarse correctamente, el servidor genera un token firmado mediante un algoritmo criptográfico (como HMAC SHA256) utilizando una clave secreta del entorno, emitiendo información relevante codificada (*payload*). En peticiones subsecuentes, el backend intercepta el token enviado en las cabeceras HTTP (típicamente `Authorization: Bearer`), verifica su autenticidad y fecha de expiración, y asimila los datos del usuario de forma estática y tipada, eliminando la necesidad de realizar consultas recurrentes a la base de datos para validar sesiones activas.


## Mapeo Objeto-Relacional y Persistencia de Datos SQL

Instalamos el motor central de abstracción de datos para interactuar con bases de datos relacionales mediante un modelo orientado a objetos, unificando el acceso al almacenamiento sin escribir código SQL nativo de forma manual.

```cmd
    npm i --save-exact sequelize
```

Sequelize proporciona una capa de abstracción robusta basada en promesas que transforma las tablas de la base de datos en modelos interactivos dentro de la aplicación, superando la complejidad de concatenar consultas en cadenas de texto propensas a errores. Permite estructurar operaciones de datos complejas mediante métodos limpios de JavaScript, garantizando la validación estricta de esquemas a nivel de software y la resolución automatizada de relaciones mediante carga asociativa eficiente.

Al integrarse en la arquitectura del proyecto, el ORM asume el control total del ciclo de vida del almacenamiento: gestiona de forma transparente la sincronización de modelos, mitiga vulnerabilidades críticas como la inyección de SQL mediante el escape automático de variables y provee un sistema de migraciones versionadas que permite evolucionar la estructura de la base de datos de manera idéntica y segura en entornos de desarrollo y producción.


## Controlador nativo para MySQL y optimización de conexiones

Instalamos el driver de bajo nivel de alto rendimiento para establecer la conectividad de red y la ejecución de consultas optimizadas entre la aplicación de Node.js y el servidor MySQL.

```cmd
    npm i --save-exact mysql2
```

`mysql2` proporciona el canal de comunicación crítico y no bloqueante que permite al backend interactuar directamente con bases de datos MySQL, superando en rendimiento, velocidad de ejecución y soporte de características modernas a los drivers tradicionales del ecosistema. Este componente se encarga de la codificación y decodificación binaria del protocolo de red de MySQL, traduciendo de forma transparente los tipos de datos del motor a tipos de datos nativos de JavaScript sin añadir sobrecarga de procesamiento en el hilo principal del servidor.

Al integrarse en el entorno de producción, el módulo gestiona de forma eficiente un pool de conexiones persistentes que reutiliza los sockets abiertos hacia la base de datos bajo escenarios de alta concurrencia, mitigando el impacto de latencia que provoca abrir y cerrar enlaces constantemente. Además, da soporte nativo a sentencias preparadas (*Prepared Statements*), una característica arquitectónica clave que optimiza el rendimiento del motor al precompilar las consultas y blinda completamente a la aplicación frente a ataques de inyección de SQL al sanitizar automáticamente los parámetros de entrada.



## Validación de esquemas y tipado estricto en tiempo de ejecución

Instalamos la infraestructura de validación de esquemas orientada a TypeScript para declarar, validar y sanitizar los datos de entrada que ingresan a la aplicación desde fuentes externas.

```cmd
    npm i --save-exact zod
```

`zod` proporciona un mecanismo robusto para construir esquemas de validación estáticos que eliminan por completo la necesidad de escribir validaciones manuales repetitivas o estructuras condicionales propensas a errores. Permite definir la forma exacta que deben tener los objetos del sistema (como cuerpos de peticiones HTTP o variables de entorno), interceptando los datos antes de que se procesen y garantizando de manera estricta que cumplan con los tipos, formatos, longitudes y restricciones requeridas por las reglas de negocio.

Al implementarse en la arquitectura del backend, el módulo actúa como una barrera de seguridad infranqueable frente a payloads maliciosos o corruptos en entornos de producción: analiza la información entrante, genera excepciones con reportes detallados y legibles de errores por campo si algo falla, y expone una capacidad única de inferencia de tipos (*Type Inference*) que permite derivar automáticamente tipos estáticos de TypeScript a partir de los esquemas de validación, asegurando la consistencia total del código tanto en tiempo de compilación como en tiempo de ejecución.
