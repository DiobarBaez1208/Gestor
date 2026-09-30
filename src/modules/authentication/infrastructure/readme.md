infrastructure/, que es donde finalmente colocamos las implementaciones concretas de los contracts que acabamos de definir en application/contracts.

La estructura:

authentication/
└── infrastructure/
    │
    ├── persistence/
    │
    └── security/

La idea central es:

Application define lo que necesita mediante contracts; Infrastructure proporciona las implementaciones reales.

1. ¿Qué es infrastructure/?

Infrastructure es la capa que contiene los detalles técnicos necesarios para que la aplicación pueda funcionar en el mundo real.

Por ejemplo:

Application dice:

"Necesito guardar una Session."

Infrastructure responde:

"Yo sé cómo guardarla usando Sequelize + MySQL."

O:

Application:

"Necesito verificar una contraseña."

Infrastructure:

"Yo sé hacerlo utilizando Argon2."

Por eso:

APPLICATION
    │
    │ necesita capacidades
    ▼
CONTRACTS
    ▲
    │ implements
    │
INFRASTRUCTURE
    │
    ├── Database
    ├── Sequelize
    ├── MySQL
    ├── Argon2
    └── JWT
2. ¿Qué problema resuelve Infrastructure?

Sin una capa de Infrastructure, terminaríamos metiendo detalles técnicos dentro de Application.

Por ejemplo, esto sería un mal acoplamiento:

// login.handler.ts

import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { Sequelize } from "sequelize";

Ahora LoginHandler conoce:

Argon2
JWT
Sequelize
infraestructura de base de datos

Entonces:

LoginHandler
     │
     ├──► Sequelize
     ├──► MySQL
     ├──► Argon2
     └──► JWT

En cambio:

LoginHandler
     │
     ├──► PasswordHasher
     ├──► TokenService
     ├──► SessionRepository
     └──► UserAuthenticationRepository

Y Infrastructure implementa esos contratos:

PasswordHasher
      ▲
      │
Argon2PasswordHasher


TokenService
      ▲
      │
JwtTokenService


SessionRepository
      ▲
      │
SequelizeSessionRepository


UserAuthenticationRepository
      ▲
      │
SequelizeUserAuthenticationRepository
3. ¿Por qué persistence/ y security/?

Porque estamos separando dos tipos diferentes de infraestructura.

infrastructure/
│
├── persistence/
│
│   └── ¿Cómo guardamos y recuperamos información?
│
└── security/
    └── ¿Cómo implementamos capacidades de seguridad?

No son dos carpetas arbitrarias.

Representan dos responsabilidades técnicas distintas.




4. persistence/

persistence contiene las implementaciones relacionadas con almacenar y recuperar información.

En nuestro módulo Authentication necesitamos principalmente implementar:

SessionRepository
UserAuthenticationRepository

Por lo tanto:

authentication/
└── infrastructure/
    └── persistence/
        ├── session.repository.ts
        └── user-authentication.repository.ts

Pero aquí hay una distinción MUY importante.

Estos archivos:

application/contracts/repositories/
├── session.repository.ts
└── user-authentication.repository.ts

son contracts.

Mientras que:

infrastructure/persistence/
├── session.repository.ts
└── user-authentication.repository.ts

son implementaciones.

5. Contract vs implementación

Tenemos:

// application/contracts/repositories/session.repository.ts

export interface SessionRepository {

    findById(
        id: SessionId,
    ): Promise<Session | null>;

    save(
        session: Session,
    ): Promise<void>;
}

Esto dice:

"Cualquier implementación debe proporcionar estas operaciones."

Pero no dice cómo.

La implementación podría ser:

export class SequelizeSessionRepository
    implements SessionRepository {

    async findById(
        id: SessionId,
    ): Promise<Session | null> {
        // Sequelize
    }

    async save(
        session: Session,
    ): Promise<void> {
        // Sequelize
    }
}

Entonces:

┌──────────────────────────────────────┐
│ Application                           │
│                                      │
│ SessionRepository                    │
│                                      │
│ findById()                           │
│ save()                               │
└──────────────────┬───────────────────┘
                   ▲
                   │ implements
                   │
┌──────────────────┴───────────────────┐
│ Infrastructure                        │
│                                      │
│ SequelizeSessionRepository           │
│                                      │
│ Sequelize                            │
│      ↓                               │
│ MySQL                                │
└──────────────────────────────────────┘
6. ¿Por qué SequelizeSessionRepository y no simplemente SessionRepository?

Porque queremos que el nombre de la implementación revele la tecnología o estrategia concreta.

Tenemos dos conceptos diferentes:

SessionRepository

= contrato.

Mientras:

SequelizeSessionRepository

= implementación.

Esto evita una ambigüedad muy común.

7. ¿Qué podría contener persistence/?

Para un diseño más completo, podría crecer hacia:

infrastructure/
└── persistence/
    │
    ├── sequelize/
    │   ├── models/
    │   ├── mappers/
    │   └── sequelize-session.repository.ts
    │
    └── ...

Pero no debemos meter todo desde el principio.

La responsabilidad de persistence/ es:

Domain object
     ↓
Repository implementation
     ↓
Persistence mechanism
     ↓
Database
8. ¿Qué ocurre con Data Mapper?

Aquí aparece un concepto que encaja especialmente bien con la arquitectura que estás construyendo.

Supongamos que Sequelize devuelve:

Database/Sequelize Model

pero nuestro dominio utiliza:

Session

No queremos que el dominio se convierta en un modelo de Sequelize.

Entonces podemos tener:

Sequelize Model
      │
      ▼
Session Mapper
      │
      ▼
Session

Y al guardar:

Session
   │
   ▼
Session Mapper
   │
   ▼
Sequelize Model
   │
   ▼
MySQL

Por eso una estructura más completa podría terminar siendo:

persistence/
│
├── sequelize/
│   │
│   ├── models/
│   │   └── session.model.ts
│   │
│   ├── mappers/
│   │   └── session.mapper.ts
│   │
│   └── repositories/
│       └── sequelize-session.repository.ts
│
└── ...

Esto mantiene separado:

Domain
≠
ORM
≠
Database

Y eso es especialmente importante en DDD + Clean Architecture.


9. security/

Ahora pasamos a:

infrastructure/
└── security/

Esta carpeta contiene las implementaciones concretas de capacidades relacionadas con seguridad.

En nuestro Authentication module tenemos:

application/contracts/services/
├── password-hasher.ts
└── token-service.ts

Por lo tanto Infrastructure puede implementar:

infrastructure/
└── security/
    ├── argon2-password-hasher.ts
    └── jwt-token-service.ts
10. Argon2PasswordHasher

Application tiene:

export interface PasswordHasher {

    hash(
        password: string,
    ): Promise<string>;

    verify(
        password: string,
        hash: string,
    ): Promise<boolean>;
}

Infrastructure proporciona:

export class Argon2PasswordHasher
    implements PasswordHasher {

    async hash(
        password: string,
    ): Promise<string> {
        // implementación con Argon2
    }

    async verify(
        password: string,
        hash: string,
    ): Promise<boolean> {
        // implementación con Argon2
    }
}

La relación es:

PasswordHasher
      ▲
      │
      │ implements
      │
Argon2PasswordHasher
      │
      ▼
    Argon2
11. JwtTokenService

Application define:

export interface TokenService {

    generateAccessToken(
        payload: TokenPayload,
    ): string;

    verifyAccessToken(
        token: string,
    ): TokenPayload;
}

Infrastructure implementa:

export class JwtTokenService
    implements TokenService {

    generateAccessToken(
        payload: TokenPayload,
    ): string {
        // implementación JWT
    }

    verifyAccessToken(
        token: string,
    ): TokenPayload {
        // implementación JWT
    }
}

Relación:

TokenService
      ▲
      │
      │ implements
      │
JwtTokenService
      │
      ▼
JWT library
12. Entonces, ¿qué contiene exactamente cada carpeta?

Podemos visualizarlo así:

authentication/
│
├── domain/
│
│   └── reglas de negocio
│
├── application/
│
│   ├── commands/
│   ├── queries/
│   ├── contracts/
│   └── dto/
│
│       "Esto es lo que necesito."
│
├── infrastructure/
│
│   ├── persistence/
│   │
│   │   "Así accedo a los datos."
│   │
│   └── security/
│
│       "Así implemento las capacidades de seguridad."
│
└── presentation/
13. Flujo completo

Ahora podemos conectar todo lo que hemos construido.

Login
HTTP Request
     │
     ▼
LoginController
     │
     ▼
LoginCommand
     │
     ▼
LoginHandler
     │
     ├──────────────────────────────┐
     │                              │
     ▼                              ▼
UserAuthenticationRepository   PasswordHasher
     │                              │
     ▼                              ▼
Sequelize Repository          Argon2PasswordHasher
     │
     ▼
   MySQL

Después:

LoginHandler
     │
     ▼
TokenService
     │
     ▼
JwtTokenService
     │
     ▼
JWT

Y:

LoginHandler
     │
     ▼
Session
     │
     ▼
SessionRepository
     │
     ▼
SequelizeSessionRepository
     │
     ▼
MySQL

Finalmente:

LoginHandler
     │
     ▼
LoginResult
     │
     ▼
LoginController
     │
     ▼
HTTP Response
14. La dirección conceptual

Todo esto nos deja una arquitectura muy clara:

                         ┌─────────────────┐
                         │    Presentation │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Application   │
                         │                 │
                         │   Use Cases     │
                         └────────┬────────┘
                                  │
                     depends on contracts
                                  │
                 ┌────────────────┴────────────────┐
                 │                                 │
                 ▼                                 ▼
        ┌─────────────────┐              ┌─────────────────┐
        │    Repository   │              │     Services    │
        │    Contracts    │              │     Contracts   │
        └────────┬────────┘              └────────┬────────┘
                 ▲                                ▲
                 │ implements                    │ implements
                 │                                │
        ┌────────┴────────┐              ┌────────┴────────┐
        │   Persistence   │              │     Security    │
        │                 │              │                 │
        │ Sequelize       │              │ Argon2          │
        │ MySQL           │              │ JWT             │
        └─────────────────┘              └─────────────────┘
15. ¿Qué aporta esta separación?
Sin infrastructure/

Los Use Cases tendrían que conocer:

MySQL
Sequelize
Argon2
JWT
Con infrastructure/

Los Use Cases solamente conocen:

SessionRepository
UserAuthenticationRepository
PasswordHasher
TokenService

Por lo tanto:

Application
    ↓
"Qué necesito"
    ↓
Contracts
    ↓
Infrastructure
    ↓
"Cómo lo hago"

Esta es una de las piezas que permite que tu Modular Monolith + DDD + Clean Architecture permanezca desacoplado.

Y hay una distinción importante para lo que sigue:

persistence/ implementa los contratos de repositorio; security/ implementa los contratos de servicios.

No debemos mezclar Session, SessionRepository, SequelizeSessionRepository, PasswordHasher y Argon2PasswordHasher como si fueran el mismo nivel: cada uno tiene una responsabilidad y una capa diferente.
































En authentication, persistence/ será la parte de Infrastructure encargada de convertir las operaciones abstractas de los Repository Contracts en operaciones reales contra la base de datos.

La estructura no debe confundirse con application/contracts/repositories/.

1. ¿Qué es persistence/?

Tenemos este contrato en Application:

application/
└── contracts/
    └── repositories/
        ├── session.repository.ts
        └── user-authentication.repository.ts

Esos archivos dicen:

"Esto es lo que Application necesita poder hacer con los datos."

persistence/ dice:

"Así es como realmente voy a hacerlo."

Por ejemplo:

Application
    │
    │ necesita
    ▼
SessionRepository
    ▲
    │ implements
    │
SequelizeSessionRepository
    │
    ▼
Sequelize
    │
    ▼
MySQL

Por lo tanto:

persistence/ = implementación técnica de almacenamiento y recuperación de información.

2. ¿Qué NO pertenece a persistence/?

Esto es importante.

persistence/ no debe contener las reglas de negocio de Session.

Por ejemplo:

session.revoke();

pertenece al dominio.

No:

repository.revokeSession();

El Repository no debería decidir:

"Una sesión debe revocarse."

Eso ya lo decidió el dominio.

El Repository solamente persiste el estado resultante.

Session
   │
   │ regla de negocio
   ▼
session.revoke()
   │
   │ nuevo estado
   ▼
SessionRepository
   │
   │ persistencia
   ▼
Database
3. ¿Qué responsabilidad tiene exactamente?

persistence/ tiene cuatro responsabilidades principales:

persistence/
│
├── 1. Modelar la persistencia
│
├── 2. Convertir datos de DB ↔ Domain
│
├── 3. Implementar Repository Contracts
│
└── 4. Ejecutar operaciones contra la DB

Y aquí aparece una separación muy importante:

Database Model
      ≠
Domain Entity

Por eso necesitamos Data Mapper.

4. Estructura recomendada

Para tu arquitectura, no dejaría simplemente:

persistence/
├── session.repository.ts
└── user-authentication.repository.ts

porque eso termina mezclando:

modelos ORM;
mapeadores;
repositories;
configuración del ORM.

Una estructura más organizada sería:

authentication/
└── infrastructure/
    └── persistence/
        │
        └── sequelize/
            │
            ├── models/
            │   ├── session.model.ts
            │   └── user.model.ts
            │
            ├── mappers/
            │   └── session.mapper.ts
            │
            └── repositories/
                ├── sequelize-session.repository.ts
                └── sequelize-user-authentication.repository.ts

Y conceptualmente:

persistence/
└── sequelize/
    │
    ├── models/
    │   └── representación de DB
    │
    ├── mappers/
    │   └── conversión DB ↔ Domain
    │
    └── repositories/
        └── implementación de Contracts

¿Por qué sequelize/?

Porque queremos dejar claro que esta implementación concreta utiliza Sequelize.

Si algún día utilizaras Prisma:

persistence/
└── prisma/

o MongoDB:

persistence/
└── mongodb/

La arquitectura superior no tendría que cambiar.

5. models/

Comencemos por:

models/

Un Persistence Model representa cómo se almacena una información utilizando la tecnología de persistencia.

En nuestro caso:

Session Domain
      ↓
Session Sequelize Model
      ↓
sessions table

Por ejemplo:

import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
} from "sequelize";

export class SessionModel extends Model<
    InferAttributes<SessionModel>,
    InferCreationAttributes<SessionModel>
> {
    declare id: string;
    declare userId: number;
    declare refreshToken: string;
    declare createdAt: Date;
    declare expiresAt: Date;
    declare revokedAt: Date | null;
}

SessionModel.init(
    {
        id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        refreshToken: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        revokedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "sessions",
        timestamps: false,
    },
);

Este objeto conoce:

Sequelize
DataTypes
Model
tableName
columns

Eso está perfectamente bien.

¿Por qué?

Porque estamos en:

Infrastructure
    ↓
Persistence
    ↓
Sequelize

No en Domain.

6. ¿Por qué no poner Sequelize Model en Domain?

Porque tendríamos:

Domain
   ↓
Sequelize

y el dominio quedaría acoplado a una tecnología concreta.

Por ejemplo, Session tendría que conocer:

extends Model

o:

DataTypes.STRING

Eso sería incorrecto para el objetivo de Clean Architecture.

Queremos:

Domain
   │
   │ independiente
   ▼
Session

y:

Infrastructure
   │
   ▼
SessionModel
   │
   ▼
Sequelize
7. Session vs SessionModel

Este es uno de los puntos más importantes de toda esta arquitectura.

Tenemos:

DOMAIN
Session

y:

INFRASTRUCTURE
SessionModel

Aunque representan conceptualmente la misma sesión, no son el mismo objeto.

Domain
Session

representa:

Una sesión con identidad, estado y comportamiento.

Tiene:

session.revoke();
session.isActive();
session.isExpired();
Persistence
SessionModel

representa:

Cómo se almacena una sesión.

Tiene:

id
userId
refreshToken
createdAt
expiresAt
revokedAt

No debería contener reglas como:

isActive()
revoke()
8. ¿Por qué necesitamos mappers/?

Ahora tenemos dos representaciones:

Domain
Session

y:

Persistence
SessionModel

Necesitamos convertir una en otra.

Eso es responsabilidad del Data Mapper.

SessionModel
     │
     │ toDomain()
     ▼
Session

Y:

Session
     │
     │ toPersistence()
     ▼
SessionModel data
9. session.mapper.ts

Podemos definir:

import { Session } from "../../../domain/entities/session.aggregate";
import { SessionId } from "../../../domain/value-objects/session-id.value-object";
import { RefreshToken } from "../../../domain/value-objects/refresh-token.value-object";
import type { SessionModel } from "../models/session.model";

export class SessionMapper {

    static toDomain(
        model: SessionModel,
    ): Session {

        const session = Session.rehydrate(
            SessionId.create(model.id),
            model.userId,
            RefreshToken.create(model.refreshToken),
            model.createdAt,
            model.expiresAt,
            model.revokedAt,
        );

        return session;
    }

    static toPersistence(
        session: Session,
    ) {
        return {
            id: session.getId().getValue(),
            userId: session.getUserId(),
            refreshToken: session.getRefreshToken().getValue(),
            createdAt: session.getCreatedAt(),
            expiresAt: session.getExpiresAt(),
            revokedAt: session.getRevokedAt(),
        };
    }
}

Pero aquí encontramos algo importante:

Nuestra Session actual tiene:

static create(...)

pero no tiene:

static rehydrate(...)

Y necesitamos distinguir creación de reconstrucción.

10. create() vs rehydrate()

Cuando creamos una sesión nueva:

Application
    ↓
Session.create(...)

estamos diciendo:

"Quiero crear una nueva sesión respetando las reglas de creación."

Pero cuando recuperamos una sesión de MySQL:

MySQL
   ↓
SessionModel
   ↓
Session

no estamos creando una sesión nueva.

Estamos reconstruyendo una que ya existía.

Por eso es conveniente tener:

static rehydrate(...)

Por ejemplo:

static rehydrate(
    id: SessionId,
    userId: number,
    refreshToken: RefreshToken,
    createdAt: Date,
    expiresAt: Date,
    revokedAt: Date | null,
): Session {

    return new Session(
        id,
        userId,
        refreshToken,
        createdAt,
        expiresAt,
        revokedAt,
    );
}

Esto requiere que SessionMapper pueda reconstruir el Aggregate sin volver a ejecutar necesariamente las reglas propias de creación.

11. ¿Por qué rehydrate() es importante?

Supongamos que tenemos:

Session creada:
2026-09-20

Hoy:

2026-09-26

La sesión puede estar:

revokedAt = null
expiresAt = 2026-10-20

Al recuperarla de la DB no queremos:

crear una sesión nueva

porque eso cambiaría:

createdAt

Necesitamos recuperar exactamente su estado persistido.

DB
 │
 ▼
SessionModel
 │
 ▼
rehydrate()
 │
 ▼
Session existente
12. repositories/

Ahora llegamos al corazón de persistence/:

repositories/
├── sequelize-session.repository.ts
└── sequelize-user-authentication.repository.ts

Estos archivos implementan los contratos definidos en Application.

13. SequelizeSessionRepository

Tenemos:

interface SessionRepository {
    findById(id: SessionId): Promise<Session | null>;
    save(session: Session): Promise<void>;
}

La implementación:

export class SequelizeSessionRepository
    implements SessionRepository {

    async findById(
        id: SessionId,
    ): Promise<Session | null> {

        const model = await SessionModel.findByPk(
            id.getValue(),
        );

        if (!model) {
            return null;
        }

        return SessionMapper.toDomain(model);
    }

    async save(
        session: Session,
    ): Promise<void> {

        const data = SessionMapper.toPersistence(
            session,
        );

        await SessionModel.upsert(data);
    }
}

Ahora podemos observar el flujo real.

14. findById()

Application llama:

const session =
    await sessionRepository.findById(
        command.sessionId,
    );

Pero Application no sabe qué ocurre debajo.

Infrastructure hace:

SessionId
    │
    ▼
getValue()
    │
    ▼
Sequelize
    │
    ▼
MySQL
    │
    ▼
SessionModel
    │
    ▼
SessionMapper.toDomain()
    │
    ▼
Session

Por lo tanto el Handler recibe:

Session

no:

SessionModel
15. save()

Cuando Logout hace:

session.revoke();

tenemos:

Session
   │
   │ revokedAt = fecha
   ▼
sessionRepository.save(session)

Infrastructure:

Session
   │
   ▼
SessionMapper.toPersistence()
   │
   ▼
plain persistence data
   │
   ▼
SessionModel.upsert()
   │
   ▼
MySQL

El Repository no decide:

"debo revocar la sesión"

Eso ya ocurrió en Domain.

16. UserAuthenticationRepository

Ahora el segundo Repository.

Application tiene:

export interface UserAuthenticationRepository {

    findByEmail(
        email: string,
    ): Promise<UserAuthentication | null>;
}

Infrastructure implementa:

export class SequelizeUserAuthenticationRepository
    implements UserAuthenticationRepository {

    async findByEmail(
        email: string,
    ): Promise<UserAuthentication | null> {

        const user = await UserModel.findOne({
            where: {
                email,
            },
        });

        if (!user) {
            return null;
        }

        return {
            userId: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            roleId: user.roleId,
        };
    }
}

Aquí hay una particularidad interesante.

No necesariamente necesitamos:

UserMapper

si únicamente estamos creando un pequeño objeto de lectura específico para autenticación.

Esto es porque:

UserAuthenticationRepository

no está intentando reconstruir necesariamente el Aggregate User.

Está obteniendo:

datos necesarios para Login

Esto es compatible con el enfoque CQRS.

17. ¿Por qué UserAuthenticationRepository puede devolver un DTO/record?

Porque su objetivo es:

Authentication
    ↓
"Necesito estos datos para autenticar."

Por ejemplo:

export interface UserAuthentication {
    userId: number;
    email: string;
    passwordHash: string;
    roleId: number;
}

No estamos diciendo:

"Este es el Aggregate User."

Estamos diciendo:

"Estos son los datos que Authentication necesita."

Es una diferencia importante.

18. Estructura final de persistence/

Para este módulo, quedaría:

authentication/
└── infrastructure/
    │
    └── persistence/
        │
        └── sequelize/
            │
            ├── models/
            │   ├── session.model.ts
            │   └── user.model.ts
            │
            ├── mappers/
            │   └── session.mapper.ts
            │
            └── repositories/
                ├── sequelize-session.repository.ts
                └── sequelize-user-authentication.repository.ts

Pero hay que hacer una precisión importante:

user.model.ts

Probablemente no debería pertenecer realmente al módulo authentication si User es propiedad del módulo users.

Una arquitectura modular más estricta sería:

modules/
│
├── users/
│   └── infrastructure/
│       └── persistence/
│           └── sequelize/
│               └── models/
│                   └── user.model.ts
│
└── authentication/
    └── infrastructure/
        └── persistence/
            └── sequelize/
                ├── models/
                │   └── session.model.ts
                │
                ├── mappers/
                │   └── session.mapper.ts
                │
                └── repositories/
                    ├── sequelize-session.repository.ts
                    └── sequelize-user-authentication.repository.ts

Y Authentication podría acceder a la información de usuarios mediante un contrato, sin apropiarse del modelo de dominio de Users.

19. La dependencia completa

La arquitectura queda:

                 DOMAIN
                   │
                   │
             ┌─────▼─────┐
             │  Session  │
             └─────┬─────┘
                   │
                   │
             Application
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
 SessionRepository   UserAuthenticationRepository
          ▲                 ▲
          │ implements      │ implements
          │                 │
          └────────┬────────┘
                   │
             Infrastructure
                   │
             persistence
                   │
             ┌─────▼─────┐
             │ Sequelize │
             └─────┬─────┘
                   │
                   ▼
                 MySQL

Y para Session:

MySQL
  │
  ▼
SessionModel
  │
  ▼
SessionMapper
  │
  ▼
Session
  │
  ▼
Domain

Al guardar:

Domain
  │
  ▼
Session
  │
  ▼
SessionMapper
  │
  ▼
SessionModel data
  │
  ▼
Sequelize
  │
  ▼
MySQL
20. La idea fundamental que debes conservar

persistence/ no es "la base de datos".

Es la infraestructura que adapta tu aplicación a un mecanismo de persistencia concreto.

La separación completa es:

┌─────────────────────────────────────────────┐
│ DOMAIN                                      │
│                                             │
│ Session                                     │
│ Reglas e invariantes                        │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│ APPLICATION                                 │
│                                             │
│ SessionRepository                           │
│ UserAuthenticationRepository                │
│                                             │
│ "Qué necesito hacer con los datos"          │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│ INFRASTRUCTURE / PERSISTENCE                 │
│                                             │
│ Repository implementations                  │
│ Mappers                                     │
│ Sequelize Models                            │
│                                             │
│ "Cómo lo hago técnicamente"                 │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
                  ┌──────────┐
                  │  MySQL   │
                  └──────────┘

En una frase: application/contracts/repositories define el qué, mientras infrastructure/persistence implementa el cómo, utilizando Sequelize/MySQL y realizando la traducción entre los modelos de persistencia y los objetos del dominio.







