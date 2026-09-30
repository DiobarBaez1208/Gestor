La idea importante es entender primero qué problema resuelve presentation y después ver cada archivo.

Presentation — introducción y modelo mental

Dentro de un módulo como authentication, tenemos:

authentication/
│
├── domain/
├── application/
├── infrastructure/
│
└── presentation/

Cada capa tiene una responsabilidad diferente:

DOMAIN
    │
    │ reglas del negocio
    ▼
APPLICATION
    │
    │ casos de uso
    ▼
PRESENTATION
    │
    │ expone esos casos de uso hacia el exterior
    ▼
HTTP / Cliente

Por ejemplo, el caso de uso:

LoginHandler

sabe cómo ejecutar el login.

Pero el LoginHandler no debería saber:

qué es Express;
qué es Request;
qué es Response;
qué URL llamó el cliente;
cómo vienen los parámetros HTTP;
cómo se valida un JSON HTTP;
qué status code utilizar;
cómo se construye una respuesta HTTP.

Ese trabajo pertenece a Presentation.

1. ¿Qué es Presentation?

Presentation es la capa que adapta el sistema hacia un medio externo de comunicación.

En nuestro caso, ese medio es:

HTTP

Por eso:

presentation/
└── http/

significa:

"Aquí se encuentra el adaptador que permite utilizar los casos de uso de Authentication mediante HTTP."

No contiene la lógica central del sistema.

Su función principal es traducir:

HTTP
  ↓
Application

y después:

Application
  ↓
HTTP
2. El modelo mental completo

Supongamos:

POST /authentication/login

con:

{
    "email": "user@example.com",
    "password": "123456"
}

El flujo es:

                     HTTP
                      │
                      ▼
              authentication.routes
                      │
                      ▼
              validation middleware
                      │
                      ▼
                login.schema
                      │
                validación Zod
                      │
                      ▼
          authentication.controller
                      │
                transforma HTTP
                      │
                      ▼
                 LoginCommand
                      │
                      ▼
                 LoginHandler
                      │
                      ▼
                    Domain
                      │
                      ▼
                 LoginResult
                      │
                      ▼
          authentication.controller
                      │
                transforma resultado
                      │
                      ▼
                 HTTP Response

Esto permite entender la responsabilidad de cada archivo.

3. Estructura actualizada

Con todo lo que hablamos, yo dejaría:

presentation/
└── http/
    ├── authentication.controller.ts
    ├── authentication.routes.ts
    │
    └── validation/
        ├── login.schema.ts
        ├── logout.schema.ts
        └── get-session.schema.ts

Es decir, eliminaría:

requests/
responses/

porque ahora los contratos HTTP salen directamente de los schemas.

4. authentication.routes.ts

Las routes responden a:

¿Qué URL HTTP existe y qué Controller debe atenderla?

Por ejemplo:

POST /authentication/login
POST /authentication/logout
GET  /authentication/sessions/:sessionId

Las routes conectan:

HTTP Route
    ↓
Middleware
    ↓
Controller

Conceptualmente:

POST /authentication/login
              │
              ▼
        validation
              │
              ▼
       controller.login()

La route no debería contener el caso de uso.

No debería hacer:

// ❌ No
const user = await database...
const passwordValid = ...
const token = ...

Eso corresponde a otras capas.

Su responsabilidad es el routing.

5. authentication.controller.ts

El Controller responde a:

¿Cómo convierto una petición HTTP en una llamada al caso de uso y cómo convierto su resultado en una respuesta HTTP?

Es el adaptador entre:

HTTP
  ↕
Application

Por ejemplo:

async login(
    req: ApiRequest<LoginEndpoint>,
    res: ApiResponse<LoginEndpoint>,
): Promise<void> {

    const result =
        await this.loginHandler.execute({
            email: req.body.email,
            password: req.body.password,
        });

    res.status(200).json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
    });
}

Observa la transformación:

HTTP
────────────────────
req.body
{
    email,
    password
}
        │
        ▼
APPLICATION
────────────────────
LoginCommand
{
    email,
    password
}

Y al regresar:

APPLICATION
────────────────────
LoginResult
{
    accessToken,
    refreshToken
}
        │
        ▼
HTTP
────────────────────
JSON Response
{
    accessToken,
    refreshToken
}

Ese es precisamente el trabajo del Controller.

6. ¿Por qué no usar directamente Request y Response?

Podríamos hacer:

async login(
    req: Request,
    res: Response,
)

pero entonces tenemos que volver a definir manualmente los tipos:

req.body as LoginRequest

o:

Request<
    LoginParams,
    LoginResponse,
    LoginRequest,
    LoginQuery
>

Y eso empieza a duplicar el contrato.

Por eso introdujimos:

core/http/
├── endpoint.interface.ts
├── endpoint-zod-schema.ts
├── infer-endpoint.ts
├── api-request.ts
└── api-response.ts

Ahora:

req: ApiRequest<LoginEndpoint>

significa:

"Este Request corresponde exactamente al contrato HTTP de Login."

Y:

res: ApiResponse<LoginEndpoint>

significa:

"Esta Response corresponde al contrato de salida de Login."

7. validation/

Aquí aparece otra responsabilidad diferente.

validation responde a:

¿La petición HTTP tiene la estructura y los datos esperados antes de entrar al Controller?

Utilizamos Zod para realizar esta validación en runtime.

Por eso:

validation/
├── login.schema.ts
├── logout.schema.ts
└── get-session.schema.ts

Cada archivo representa el contrato HTTP de un endpoint.

8. login.schema.ts

Representa:

POST /authentication/login

Su contrato completo es:

params
query
body
response

Por eso:

export const loginSchema = z.object({
    params: z.object({}).strict(),

    query: z.object({}).strict(),

    body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
    }).strict(),

    response: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
    }).strict(),
});

Tenemos dos conceptos diferentes aquí.

Zod
loginSchema

sirve para:

RUNTIME

Es decir:

¿Los datos que realmente llegaron son válidos?
InferEndpoint
export type LoginEndpoint =
    InferEndpoint<typeof loginSchema>;

sirve para:

COMPILE TIME

Es decir:

¿Cómo conoce TypeScript la estructura de este endpoint?
9. logout.schema.ts

Representa:

POST /authentication/logout

Tiene:

params → {}
query  → {}
body   → { sessionId }
response → null

Por ejemplo:

export const logoutSchema = z.object({
    params: z.object({}).strict(),

    query: z.object({}).strict(),

    body: z.object({
        sessionId: z.string().min(1),
    }).strict(),

    response: z.null(),
});

El resultado HTTP de un logout exitoso es:

204 No Content

Por eso:

response: z.null()

representa correctamente que no existe contenido de respuesta.

10. get-session.schema.ts

Representa:

GET /authentication/sessions/:sessionId

Aquí tenemos:

params
    │
    └── sessionId

por lo que:

export const getSessionSchema = z.object({
    params: z.object({
        sessionId: z.string().min(1),
    }).strict(),

    query: z.object({}).strict(),

    body: z.object({}).strict(),

    response: z.object({
        id: z.string(),
        userId: z.number().int(),
        createdAt: z.string(),
        expiresAt: z.string(),
        revokedAt: z.string().nullable(),
        active: z.boolean(),
    }).strict(),
});

Y de aquí se deriva:

export type GetSessionEndpoint =
    InferEndpoint<typeof getSessionSchema>;

Entonces:

req.params.sessionId

queda correctamente tipado como:

string
11. ¿Qué pasó con requests/?

Antes teníamos:

requests/
├── login.request.ts
└── logout.request.ts

Por ejemplo:

export interface LoginRequest {
    email: string;
    password: string;
}

El problema es que ahora tendríamos:

login.schema.ts
        +
login.request.ts

describiendo prácticamente la misma cosa.

El schema ya contiene:

body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

y mediante:

InferEndpoint<typeof loginSchema>

obtenemos el tipo automáticamente.

Por tanto:

❌ Antes

login.request.ts
login.schema.ts

puede convertirse en:

✅ Ahora

login.schema.ts

El schema se convierte en la fuente de verdad del contrato HTTP.

12. ¿Qué pasó con responses/?

La misma situación.

Antes:

responses/
├── login.response.ts
└── session.response.ts

Podríamos tener:

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

Pero ya tenemos:

response: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
})

Por lo que volver a escribir:

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

sería duplicación.

13. Entonces, ¿dónde vive el contrato?

Ahora tenemos una única fuente:

login.schema.ts
        │
        ├── Runtime
        │     │
        │     └── Zod validation
        │
        └── Compile time
              │
              └── InferEndpoint

Y:

LoginEndpoint
      │
      ├── ApiRequest<LoginEndpoint>
      │
      └── ApiResponse<LoginEndpoint>

Por eso:

validation/
├── login.schema.ts
├── logout.schema.ts
└── get-session.schema.ts

es suficiente.

14. Pero ojo: validation no reemplaza al Domain

Esto es fundamental.

Supongamos:

email: z.string().email()

Zod puede comprobar:

¿Es un string?
¿Tiene formato de email?

Pero Zod no debería convertirse en el lugar donde modelamos todas las reglas del negocio.

Por ejemplo:

"Una sesión solamente puede ser revocada una vez."

Eso pertenece al:

Domain

y ya lo tenemos en:

session.revoke()

Otro ejemplo:

"Una sesión expirada no está activa."

está en:

session.isActive()

Por tanto:

PRESENTATION
──────────────────────────
Zod
Formato HTTP
Tipos HTTP
Request
Response
Status codes


APPLICATION
──────────────────────────
Commands
Queries
Handlers
Use Cases


DOMAIN
──────────────────────────
Entities
Aggregates
Value Objects
Domain Rules
Domain Errors

No debemos convertir validation en una segunda capa de Domain.

15. El flujo real completo

Con todo lo que hemos construido hasta ahora:

CLIENT
  │
  │ POST /authentication/login
  │
  ▼
┌────────────────────────────────────────┐
│ PRESENTATION                           │
│                                        │
│ authentication.routes.ts               │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│ validation/login.schema.ts             │
│                                        │
│ Zod                                    │
│ params / query / body / response       │
└───────────────────┬────────────────────┘
                    │
               válido
                    │
                    ▼
┌────────────────────────────────────────┐
│ authentication.controller.ts           │
│                                        │
│ ApiRequest<LoginEndpoint>              │
│ ApiResponse<LoginEndpoint>             │
└───────────────────┬────────────────────┘
                    │
                    │ transforma
                    ▼
┌────────────────────────────────────────┐
│ APPLICATION                            │
│                                        │
│ LoginCommand                           │
│        ↓                               │
│ LoginHandler                           │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│ DOMAIN                                 │
│                                        │
│ Session                                │
│ SessionId                              │
│ RefreshToken                           │
└────────────────────────────────────────┘

Y al regresar:

DOMAIN
   │
   ▼
LoginHandler
   │
   │ LoginResult
   ▼
Controller
   │
   │ HTTP representation
   ▼
ApiResponse<LoginEndpoint>
   │
   ▼
HTTP 200
   │
   ▼
CLIENT
16. Estructura final de presentation

Por tanto, para tu módulo authentication, la estructura que estamos construyendo queda:

authentication/
│
├── domain/
│
├── application/
│
├── infrastructure/
│
└── presentation/
    │
    └── http/
        │
        ├── authentication.controller.ts
        │
        ├── authentication.routes.ts
        │
        └── validation/
            ├── login.schema.ts
            ├── logout.schema.ts
            └── get-session.schema.ts

Y las responsabilidades quedan extremadamente claras:

presentation/
│
└── http/
    │
    ├── routes
    │      └── ¿Qué URL existe y qué endpoint atiende?
    │
    ├── controller
    │      └── ¿Cómo traduzco HTTP ↔ Application?
    │
    └── validation
           └── ¿La petición HTTP cumple el contrato?

Mientras que los contratos reutilizables que hacen posible el tipado están fuera del módulo:

core/
└── http/
    ├── endpoint.interface.ts
    ├── endpoint-zod-schema.ts
    ├── infer-endpoint.ts
    ├── api-request.ts
    ├── api-response.ts
    ├── server.ts
    ├── router.ts
    ├── request-context.ts
    └── http-status.ts

La idea central es:

presentation/http conoce HTTP; application conoce casos de uso; domain conoce negocio.

Y dentro de presentation/http, validation valida, routes enruta y controller adapta. Esa separación es la que evita que el Controller termine convirtiéndose en una mezcla de routing, validación, lógica de negocio y acceso a infraestructura.



En este caso no usamos return res.status(...).json(...) porque el Controller tiene como responsabilidad ejecutar el caso de uso y escribir directamente la respuesta HTTP mediante el objeto Response; no necesita devolver ese objeto a ningún otro componente. Por eso, el método se define como Promise<void> y termina después de res.status(...).json(...) o res.status(...).send(). El return en return res.status(...) no hace que Express envíe la respuesta —la respuesta ya se envía al ejecutar json() o send()—, sino que únicamente devuelve el objeto Response desde la función. En esta arquitectura, evitarlo mantiene una intención más clara: el Controller produce la respuesta HTTP, no retorna el objeto de Express como resultado del caso de uso. Esto es una convención de diseño y claridad, no una diferencia de rendimiento ni una exigencia de Clean Architecture.