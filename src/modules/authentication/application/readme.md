es perfectamente válido que Application importe errores definidos en Domain.

La clave está en la dirección de la dependencia.

Application
     │
     ▼
Domain

Eso es correcto. Lo que queremos evitar es:

Domain
     │
     ▼
Application

porque entonces el núcleo del dominio dependería de una capa exterior.

Porque Application está diciendo:

"Estoy utilizando una regla/concepto de error que pertenece al dominio."

No está haciendo que Domain dependa de Application.

La dirección correcta
                    ┌─────────────┐
                    │   DOMAIN    │
                    │             │
                    │  Entities   │
                    │ ValueObjects│
                    │ Domain      │
                    │ Errors      │
                    └──────▲──────┘
                           │
                           │ depends on
                           │
                    ┌──────┴──────┐
                    │ APPLICATION │
                    │             │
                    │ Use Cases   │
                    │ Handlers    │
                    │ Contracts   │
                    └──────▲──────┘
                           │
                           │
                    ┌──────┴───────┐
                    │ PRESENTATION │
                    └──────────────┘

Infrastructure ───────► Application / Domain

La idea fundamental de Clean Architecture es que las capas externas pueden depender de las internas, no al revés.

¿Por qué entonces el error está en Domain?

Porque InvalidCredentialsError expresa un concepto del negocio:

Las credenciales proporcionadas no permiten autenticar al usuario.

No es un error de:

HTTP
MySQL
Express
Sequelize
JWT

Por eso puede vivir en Domain.

Application simplemente lo utiliza.


¿Y Presentation qué hace con ese error?

Aquí aparece otra separación importante.

Application lanza:

InvalidCredentialsError

Pero HTTP no debería conocer necesariamente toda la lógica interna del dominio.

El error llega:

LoginHandler
    │
    │ throw
    ▼
InvalidCredentialsError
    │
    ▼
Error Middleware
    │
    ▼
HTTP 401








 
 
 
 Y aquí está la distinción que debemos mantener durante todo el diseño
 
 No debemos confundir:
 
 COMMAND
 
 con:
 
 USE CASE
 
 ni con:
 
 DOMAIN ENTITY
 
 Son tres cosas diferentes:
 
 COMMAND: "Quiero iniciar sesión con estos datos."
 USE CASE: LoginHandler - "Voy a ejecutar el proceso de Login."
 DOMAIN: Session - "Yo mantengo las reglas de una sesión."
 
 Y todavía no necesitamos introducir Repository, TokenService, PasswordHasher, Mediator, DTO, etc.
 
 Primero dejamos perfectamente definida esta base:
 
 Command = entrada del Use Case.
 Handler = ejecución del Use Case.
 Result = salida del Use Case.


Command = quiero ejecutar una operación que modifica el estado.
Query = quiero obtener información sin modificar el estado.


5. Entonces, ¿qué contiene commands/login/?

Tenemos:

login/
│
├── login.command.ts
├── login.handler.ts
└── login.result.ts

Cada archivo representa una pieza diferente del mismo Use Case.

                    LOGIN
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
     Command       Handler        Result
        │             │             │
     Entrada       Ejecución       Salida

Es decir:

login.command.ts
        ↓
"Qué quiero hacer + datos necesarios"

login.handler.ts
        ↓
"Cómo se ejecuta el caso de uso"

login.result.ts
        ↓
"Qué devuelve el caso de uso"
















2. ¿Qué es un Command?

Un Command es un objeto que representa una intención de modificar el estado del sistema.

Dicho de forma sencilla:

Un Command describe qué operación se quiere realizar y qué datos necesita para realizarla.

Por ejemplo:

Login

El usuario quiere iniciar sesión.

Para hacerlo necesitamos:

email
password

Entonces podemos representar esa intención mediante:

LoginCommand

que contiene:

email
password
3. ¿Por qué necesitamos un Command?

Podríamos hacer directamente:

login(email, password)

Pero cuando utilizamos CQRS + Mediator, queremos representar explícitamente la operación:

LoginCommand

Esto nos permite tener:

HTTP Request
     │
     ▼
LoginCommand
     │
     ▼
LoginHandler
     │
     ▼
resultado

El Command no ejecuta nada.

Esto es extremadamente importante.

LoginCommand NO:
consulta la base de datos
verifica passwords
genera JWT
crea sesiones
llama repositorios
modifica entidades

Solo transporta la intención y sus datos.

5. Entonces, ¿qué contiene commands/login/?

Tenemos:

login/
│
├── login.command.ts
├── login.handler.ts
└── login.result.ts

Cada archivo representa una pieza diferente del mismo Use Case.

                    LOGIN
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
     Command       Handler        Result
        │             │             │
     Entrada       Ejecución       Salida

Es decir:

login.command.ts
        ↓
"Qué quiero hacer + datos necesarios"

login.handler.ts
        ↓
"Cómo se ejecuta el caso de uso"

login.result.ts
        ↓
"Qué devuelve el caso de uso"




















1. ¿Qué es queries?

En CQRS, una Query representa una solicitud cuyo objetivo es obtener información sin modificar el estado del sistema.

Por ejemplo:

Commands
├── Login   → modifica estado
└── Logout  → modifica estado

Queries
└── GetSession → obtiene información

La diferencia fundamental es:

COMMAND
    ↓
"Quiero cambiar algo."

QUERY
    ↓
"Quiero consultar algo."

Por eso:

application/
├── commands/
└── queries/
2. ¿Qué es get-session?

get-session representa el caso de uso de consultar una sesión existente.

La intención sería:

"Quiero obtener la información de esta sesión."

Por ejemplo:

sessionId = "abc-123"

Queremos obtener información como:

id
userId
createdAt
expiresAt
revokedAt
active

Pero no queremos modificar la sesión.

Por eso es una Query.

3. Estructura
queries/
└── get-session/
    ├── get-session.query.ts
    ├── get-session.handler.ts
    └── get-session.result.ts

Nuevamente tenemos:

Query
  ↓
Handler
  ↓
Result

Es decir:

GetSessionQuery
      │
      ▼
GetSessionHandler
      │
      ▼
GetSessionResult



Y el modelo mental ahora es:

                 APPLICATION
                      │
          ┌───────────┴───────────┐
          │                       │
       COMMANDS                QUERIES
          │                       │
          │                       │
    modifican estado         consultan estado
          │                       │
          ▼                       ▼
      Command                  Query
          │                       │
          ▼                       ▼
       Handler                  Handler
          │                       │
          ▼                       ▼
       Result                  Result

La diferencia fundamental es:

Command = quiero ejecutar una operación que modifica el estado.
Query = quiero obtener información sin modificar el estado.






























1. ¿Qué es contracts/?

contracts/ contiene interfaces que describen capacidades que Application necesita para ejecutar sus Use Cases.

La idea central es:

Application dice qué necesita, pero no cómo se hace.

Por ejemplo, LoginHandler necesita poder:

buscar al usuario;
verificar su contraseña;
generar tokens;
guardar una sesión.

Pero LoginHandler no debería saber:

si la base de datos es MySQL;
si usamos Sequelize;
si la contraseña se verifica con Argon2;
si el JWT se genera con jsonwebtoken;
cómo se ejecuta un SELECT;
cómo se ejecuta un INSERT.

Por eso Application define contratos:

Application
     │
     │ "Necesito esta capacidad"
     ▼
   CONTRACT
     │
     │ implementación concreta
     ▼
Infrastructure

Por ejemplo:

LoginHandler
    │
    ├── UserAuthenticationRepository
    ├── PasswordHasher
    ├── TokenService
    └── SessionRepository

Application solamente conoce esas interfaces.


2. ¿Por qué esto es importante?

Sin contracts, podríamos terminar haciendo esto:

import { UserRepository } from "../../infrastructure/database/mysql/user.repository";
import { Argon2PasswordHasher } from "../../infrastructure/security/argon2-password-hasher";
import { JwtTokenService } from "../../infrastructure/security/jwt-token-service";

Entonces:

Application
     │
     ├──────────► MySQL
     ├──────────► Sequelize
     ├──────────► Argon2
     └──────────► JWT

Eso rompe el desacoplamiento.

En cambio:

Application
     │
     ├──► UserAuthenticationRepository
     ├──► PasswordHasher
     └──► TokenService

Y posteriormente:

                     ┌─────────────────────────────┐
                     │        Application          │
                     │                             │
                     │       LoginHandler          │
                     └──────────────┬──────────────┘
                                    │
                      depends on contracts
                                    │
             ┌──────────────────────┼─────────────────────┐
             ▼                      ▼                     ▼
 UserAuthenticationRepository   PasswordHasher      TokenService
             ▲                      ▲                     ▲
             │                      │                     │
             │ implements           │ implements         │ implements
             │                      │                     │
     MySQL repository       Argon2PasswordHasher    JwtTokenService

La implementación puede cambiar sin modificar el Use Case.

3. ¿Por qué se dividen en repositories/ y services/?

Porque representan dos tipos diferentes de dependencia.

contracts/
│
├── repositories/
│
│   → acceso/persistencia de información
│
└── services/
    │
    → capacidades técnicas necesarias por Application

No son simplemente dos carpetas para organizar archivos.

Representan responsabilidades diferentes.




4. repositories/

Un Repository Contract define cómo Application puede obtener o persistir objetos/datos del dominio, sin conocer la tecnología utilizada para hacerlo.

Por ejemplo:

LoginHandler
    │
    │ "dame los datos de autenticación
    │  de este usuario"
    ▼
UserAuthenticationRepository
    │
    │
    ▼
implementación concreta
    │
    ▼
MySQL

Application no sabe que abajo existe MySQL.

Podría ser:

MySQL
PostgreSQL
MongoDB
API externa
memoria
etc.

Mientras cumpla el contrato.




5. services/

Los contracts dentro de services/ representan capacidades que Application necesita ejecutar, pero cuya implementación pertenece a otra capa.

Por ejemplo:

LoginHandler
    │
    ├── PasswordHasher
    │       └── "verifica una contraseña"
    │
    └── TokenService
            └── "genera/verifica tokens"

Application conoce:

passwordHasher.verify(...)

pero no conoce:

Argon2
bcrypt
jsonwebtoken
jose
etc.






6. Diferencia fundamental

Esta distinción es importante:

Contract	Pregunta que responde
Repository	¿Cómo obtengo/guardo información?
Service	¿Qué capacidad externa necesita ejecutar Application?

Por ejemplo:

SessionRepository
→ obtener/guardar Session

mientras:

PasswordHasher
→ verificar una contraseña

y:

TokenService
→ generar/verificar tokens




7. Ahora sí: session.repository.ts

Este contrato representa la capacidad que Application necesita para persistir y recuperar sesiones.

Recordemos nuestro Aggregate:

Session

Por lo tanto, el Repository trabaja conceptualmente con:

Session

y no con:

SequelizeModel

ni:

MySQLRow

ni:

DatabaseRecord

porque esos detalles pertenecen a Infrastructure.

Una primera definición:

import type { Session } from "../../../domain/entities/session.aggregate";
import type { SessionId } from "../../../domain/value-objects/session-id.value-object";

export interface SessionRepository {

    findById(
        id: SessionId,
    ): Promise<Session | null>;

    save(
        session: Session,
    ): Promise<void>;
}
8. ¿Qué significa findById()?
findById(
    id: SessionId,
): Promise<Session | null>;

Significa:

"Application puede pedirme una Session utilizando su SessionId."

Puede ocurrir:

Session encontrada
        ↓
     Session

o:

Session no encontrada
        ↓
      null

Por eso:

Promise<Session | null>
9. ¿Por qué recibe SessionId y no string?

Por la misma razón que acabamos de aplicar a GetSessionQuery.

Tenemos un Value Object:

SessionId

Por lo tanto:

findById(id: SessionId)

expresa mejor el contrato que:

findById(id: string)

El contrato dice:

"Para buscar una sesión necesito un identificador de sesión válido."

No:

"Dame cualquier string."

10. ¿Qué significa save()?
save(
    session: Session,
): Promise<void>;

Significa:

"Application puede pedir que una Session sea persistida."

Por ejemplo, durante Login:

crear Session
     ↓
sessionRepository.save(session)
     ↓
persistir Session

Durante Logout:

obtener Session
     ↓
session.revoke()
     ↓
sessionRepository.save(session)

El Repository no decide la regla de negocio.

La regla:

session.revoke();

pertenece a Session.

El Repository solamente persiste el nuevo estado.

11. ¿Por qué save() no dice INSERT o UPDATE?

Porque Application no debería preocuparse por eso.

Application dice:

repository.save(session);

Infrastructure decide si eso termina siendo:

INSERT INTO sessions ...

o:

UPDATE sessions ...

o alguna otra estrategia.

Eso es justamente el desacoplamiento.

12. user-authentication.repository.ts

Este Repository tiene una responsabilidad diferente.

No representa simplemente:

"Repository de usuarios."

Representa específicamente:

La información que el caso de uso de autenticación necesita para autenticar a un usuario.

Eso es importante.

Por ejemplo, Login puede necesitar:

userId
email
passwordHash
roleId

No necesariamente necesita recuperar toda la entidad User.

Por eso este contrato puede estar orientado a la necesidad del caso de uso.

Por ejemplo:

export interface UserAuthentication {
    userId: number;
    email: string;
    passwordHash: string;
    roleId: number;
}

y:

export interface UserAuthenticationRepository {

    findByEmail(
        email: string,
    ): Promise<UserAuthentication | null>;
}
13. ¿Por qué no llamarlo simplemente UserRepository?

Porque estaríamos mezclando responsabilidades.

Imagina que User tiene:

nombre
apellido
email
password
dirección
teléfono
departamento
fecha de nacimiento
...

Pero Login solamente necesita:

userId
email
passwordHash
roleId

No tiene sentido que el Use Case de autenticación dependa de toda la persistencia de User.

Por eso:

UserAuthenticationRepository

expresa:

"Dame específicamente la información necesaria para autenticar."

Esto también encaja muy bien con CQRS y con el diseño por Use Cases.


14. ¿Dónde queda User?

El módulo users puede tener su propio dominio:

modules/
└── users/
    └── domain/
        └── entities/
            └── user.entity.ts

Pero Authentication no necesariamente necesita manipular directamente ese Aggregate.

Puede necesitar solamente:

UserAuthentication

para ejecutar Login.

Así evitamos acoplar Authentication innecesariamente al modelo completo de Users.







15. password-hasher.ts

Ahora pasamos a services/.

Este contract representa una capacidad:

convertir/verificar contraseñas de forma segura.

export interface PasswordHasher {

    hash(
        password: string,
    ): Promise<string>;

    verify(
        password: string,
        hash: string,
    ): Promise<boolean>;
}
16. ¿Por qué es un contract?

Porque Application necesita decir:

await passwordHasher.verify(
    command.password,
    user.passwordHash,
);

Pero no debería decir:

argon2.verify(...)

La diferencia es enorme.

Application:

"Necesito verificar una contraseña."

Infrastructure:

"Voy a utilizar Argon2 para hacerlo."
17. ¿Quién implementará PasswordHasher?

Posteriormente Infrastructure podría tener:

authentication/
└── infrastructure/
    └── security/
        └── argon2-password-hasher.ts

con:

export class Argon2PasswordHasher
    implements PasswordHasher {

    async hash(password: string): Promise<string> {
        // Argon2
    }

    async verify(
        password: string,
        hash: string,
    ): Promise<boolean> {
        // Argon2
    }
}

Entonces:

Application
     │
     ▼
PasswordHasher
     ▲
     │ implements
     │
Argon2PasswordHasher
     │
     ▼
argon2

Application nunca necesita importar argon2.










18. token-service.ts

Este contract representa la capacidad de trabajar con tokens de autenticación.

Una definición inicial:

export interface TokenPayload {
    userId: number;
    roleId: number;
}

export interface TokenService {

    generateAccessToken(
        payload: TokenPayload,
    ): string;

    verifyAccessToken(
        token: string,
    ): TokenPayload;
}
19. ¿Qué problema resuelve?

El Login necesita generar un access token:

Login
  ↓
usuario autenticado
  ↓
TokenService
  ↓
accessToken

Pero Application no debería conocer JWT.

Por ejemplo, queremos evitar:

import jwt from "jsonwebtoken";

dentro de:

login.handler.ts

En su lugar:

const accessToken =
    tokenService.generateAccessToken({
        userId: user.userId,
        roleId: user.roleId,
    });
20. ¿Por qué TokenService no se llama JwtService?

Porque:

JWT

es una tecnología/estrategia de implementación.

Mientras que:

TokenService

representa la capacidad que necesita Application.

Application necesita:

generar/verificar tokens.

Infrastructure decide:

utilizar JWT.

Por ejemplo:

Application
      │
      ▼
TokenService
      ▲
      │
      │ implements
      │
JwtTokenService
      │
      ▼
jsonwebtoken / jose

Esto permite cambiar posteriormente la tecnología sin modificar el Use Case.

21. Los cuatro contracts juntos

Ahora podemos ver claramente qué necesita Authentication Application:

authentication/
└── application/
    └── contracts/
        │
        ├── repositories/
        │   │
        │   ├── SessionRepository
        │   │       │
        │   │       └── guardar/obtener sesiones
        │   │
        │   └── UserAuthenticationRepository
        │           │
        │           └── obtener información
        │               necesaria para autenticar
        │
        └── services/
            │
            ├── PasswordHasher
            │       │
            │       └── verificar/hashear contraseñas
            │
            └── TokenService
                    │
                    └── generar/verificar tokens
22. ¿Qué pasa ahora con LoginHandler?

Ahora empieza a tener sentido todo lo que habíamos dejado pendiente.

Anteriormente teníamos:

export class LoginHandler {

    async execute(
        command: LoginCommand,
    ): Promise<LoginResult> {

        throw new Error("Not implemented");
    }
}

Ahora podemos ver sus dependencias:

LoginHandler
    │
    ├── LoginCommand
    │
    ├── UserAuthenticationRepository
    │
    ├── PasswordHasher
    │
    ├── TokenService
    │
    └── SessionRepository

Y el flujo conceptual:

LoginCommand
     │
     ▼
LoginHandler
     │
     ├──► UserAuthenticationRepository
     │          │
     │          └──► usuario
     │
     ├──► PasswordHasher
     │          │
     │          └──► contraseña válida?
     │
     ├──► TokenService
     │          │
     │          └──► accessToken
     │
     ├──► Session
     │          │
     │          └──► nueva sesión
     │
     └──► SessionRepository
                │
                └──► guardar sesión
                         │
                         ▼
                    LoginResult

Y aquí se ve perfectamente la función de contracts/:

                  APPLICATION
                       │
                 ┌─────┴─────┐
                 │           │
             Use Cases   Contracts
                 │           │
                 └─────┬─────┘
                       │
                 NO conoce
                 implementaciones
                       │
                       ▼
                 INFRASTRUCTURE
En resumen
Archivo	Application necesita...	Infrastructure podría usar...
session.repository.ts	guardar/obtener Session	Sequelize + MySQL
user-authentication.repository.ts	obtener datos para autenticar	Sequelize + MySQL
password-hasher.ts	hash/verify de contraseña	Argon2
token-service.ts	generar/verificar tokens	JWT + jsonwebtoken/jose

La regla fundamental es:

Los contracts pertenecen a la necesidad de Application; las implementaciones pertenecen a Infrastructure.

Y esto produce la dirección de dependencias que buscamos:

Domain
  ▲
  │
Application ────────► Contracts
  ▲                       ▲
  │                       │
  │                  implements
  │                       │
Presentation          Infrastructure

Con esto ya podemos pasar al siguiente nivel: definir exactamente cada uno de los cuatro contracts, empezando por SessionRepository, incluyendo qué métodos debe tener, por qué esos métodos y cuáles NO debemos agregar.