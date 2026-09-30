# Unit of Work 

Tenemos una operación:

Crear usuario + asignarle un rol

Las dos operaciones deben ejecutarse dentro de una misma transacción.

```cmd
    Crear usuario
        +
    Asignar rol
        ↓
    UNA SOLA TRANSACCIÓN
```


Ahora queremos que funcione tanto con:

```cmd
MySQL + Sequelize
```

como con:

```cmd
PostgreSQL + Prisma
```

## Primero: ¿qué es UnitOfWork?

UnitOfWork representa:

"Ejecuta estas operaciones como una sola unidad transaccional."

Por eso tenemos un contrato común:
```cmd
core/
└── database/
    └── unit-of-work.ts
```
```ts
export interface UnitOfWork {
    execute<T>(
        work: () => Promise<T>,
    ): Promise<T>
}
```

Esto no sabe cómo funciona una BD.

Solo dice: "Necesito poder ejecutar algo dentro de una transacción."


## Ahora aparece MySQL

Tenemos:

```cmd
    MySQL
       ↑
    Sequelize
       ↑
    SequelizeUnitOfWork
       ↑
    UnitOfWork
```

La implementación es:

```ts

export class SequelizeUnitOfWork implements UnitOfWork {

    constructor(
        private readonly database: Sequelize,
    ) {}

    async execute<T>(
        work: () => Promise<T>,
    ): Promise<T> {

        return this.database.transaction(async () => {
            return work()
        })
    }
}
```

Entonces:

```cmd
SequelizeUnitOfWork
        │
        │ abre
        ▼
 Sequelize Transaction
        │
        ▼
    operaciones
        │
        ▼
      MySQL
```

## ¿Qué operaciones queremos ejecutar?

Tenemos dos repositorios:
```cmd
UserRepository
RoleRepository
```
Sus contratos:

```ts
interface UserRepository {
    create(user: User): Promise<void>
}

interface RoleRepository {
    assign(
        userId: string,
        roleId: string,
    ): Promise<void>
}
```

Estos contratos tampoco saben qué BD utilizamos.


## Implementaciones para MySQL

Ahora sí hacemos las implementaciones concretas:

```cmd
infrastructure/
└── database/
    └── mysql/
        └── repositories/
            ├── mysql-user-repository.ts
            └── mysql-role-repository.ts
```

Tenemos:
```cmd
UserRepository
      ↑
      │ implements
      │
MySqlUserRepository
```

y:

```cmd
RoleRepository
      ↑
      │ implements
      │
MySqlRoleRepository
```

Por lo tanto, cuando trabajamos con MySQL tenemos:

```cmd
┌────────────────────────────────────┐
│             MYSQL                  │
│                                    │
│  SequelizeUnitOfWork               │
│          │                         │
│          ▼                         │
│    Sequelize Transaction           │
│          │                         │
│     ┌────┴────┐                    │
│     ▼         ▼                    │
│ MySqlUser   MySqlRole              │
│ Repository  Repository              │
│     │         │                    │
│     └────┬────┘                    │
│          ▼                         │
│        MySQL                       │
└────────────────────────────────────┘
```

## El Use Case

Ahora viene la parte importante.

El Use Case NO dice:

```cmd
SequelizeUnitOfWork
```
ni:

```cmd
MySqlUserRepository
```
ni:

```cmd
MySqlRoleRepository
```

Dice solamente:

```ts
export class CreateUserUseCase {

    constructor(
        private readonly unitOfWork: UnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly roleRepository: RoleRepository,
    ) {}

    async execute(input: CreateUserInput): Promise<void> {

        await this.unitOfWork.execute(async () => {

            const user = User.create(
                input.name,
                input.email,
            )

            await this.userRepository.create(user)

            await this.roleRepository.assign(
                user.id.value,
                input.roleId,
            )
        })
    }
}
```

Mira lo que está ocurriendo:

```cmd
CreateUserUseCase
        │
        ▼
   unitOfWork.execute()
        │
        │ "todo esto es una transacción"
        ▼
 ┌─────────────────────┐
 │ create user         │
 │                     │
 │ assign role         │
 └─────────────────────┘
```

6. ¿Cómo funciona realmente con MySQL?

Al construir la aplicación hacemos:


```ts
const unitOfWork =
    new SequelizeUnitOfWork(sequelize)

const userRepository =
    new MySqlUserRepository()

const roleRepository =
    new MySqlRoleRepository()
```

Y se los damos al Use Case:

```ts
const createUserUseCase =
    new CreateUserUseCase(
        unitOfWork,
        userRepository,
        roleRepository,
    )
```

Entonces tenemos:

```cmd
CreateUserUseCase
        │
        ├───────────────► SequelizeUnitOfWork
        │
        ├───────────────► MySqlUserRepository
        │
        └───────────────► MySqlRoleRepository
```

Cuando ejecutamos:

```ts
await createUserUseCase.execute(input)
```

ocurre:

```cmd
CreateUserUseCase
        │
        ▼
SequelizeUnitOfWork
        │
        ▼
BEGIN TRANSACTION
        │
        ├──► MySqlUserRepository.create()
        │
        └──► MySqlRoleRepository.assign()
        │
        ▼
COMMIT
        │
        ▼
      MySQL
```

## Ahora cambiamos de BD

Supongamos que mañana dices:

"Ya no quiero MySQL + Sequelize. Quiero PostgreSQL + Prisma."

No cambiamos el Use Case.

Sigue exactamente así:

```ts

await this.unitOfWork.execute(async () => {

    await this.userRepository.create(user)

    await this.roleRepository.assign(
        user.id.value,
        input.roleId,
    )
})
```

Lo que cambiamos son las implementaciones.

8. PostgreSQL tiene su propio UnitOfWork

Creamos:

```cmd
infrastructure/
└── database/
    └── postgresql/
        ├── prisma-unit-of-work.ts
        └── repositories/
            ├── postgresql-user-repository.ts
            └── postgresql-role-repository.ts
```

El nuevo Unit of Work:

```ts
export class PrismaUnitOfWork implements UnitOfWork {

    constructor(
        private readonly database: PrismaClient,
    ) {}

    async execute<T>(
        work: () => Promise<T>,
    ): Promise<T> {

        return this.database.$transaction(
            async () => {
                return work()
            },
        )
    }
}
```

Ahora tenemos:

```cmd
PostgreSQL
     ↑
   Prisma
     ↑
PrismaUnitOfWork
     ↑
 UnitOfWork
```

## PostgreSQL tiene sus propios repositorios

Ahora:

```cmd
UserRepository
      ↑
      │
PostgreSqlUserRepository
```
y:

```cmd
RoleRepository
      ↑
      │
PostgreSqlRoleRepository
```


## Construimos nuevamente el Use Case

Pero ahora inyectamos otras implementaciones:

```ts
const unitOfWork =
    new PrismaUnitOfWork(prisma)

const userRepository =
    new PostgreSqlUserRepository(prisma)

const roleRepository =
    new PostgreSqlRoleRepository(prisma)
```
Y:

```ts
const createUserUseCase =
    new CreateUserUseCase(
        unitOfWork,
        userRepository,
        roleRepository,
    )
```

¡El Use Case no cambió!

## Ahora mira ambas versiones juntas

Con MySQL

```cmd
                  CreateUserUseCase
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        UnitOfWork   UserRepo    RoleRepo
              │          │          │
              ▼          ▼          ▼
     SequelizeUoW   MySqlUser   MySqlRole
              │      Repository  Repository
              │          │          │
              └──────────┼──────────┘
                         ▼
                       MySQL
```

Con PostgreSQL

```cmd
                  CreateUserUseCase
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        UnitOfWork   UserRepo    RoleRepo
              │          │          │
              ▼          ▼          ▼
        PrismaUoW    PostgreSQL   PostgreSQL
              │       UserRepo     RoleRepo
              │          │          │
              └──────────┼──────────┘
                         ▼
                    PostgreSQL
```

## ¿Qué NO cambió?

Esto:

```cmd
Domain
Application
Use Cases
Interfaces
Reglas de negocio
```

continúa igual.

Lo que cambió fue:

```cmd
Infrastructure
    │
    ├── UnitOfWork
    ├── Repositories
    ├── Connection
    └── ORM
```

## Y aquí está el verdadero significado

La arquitectura queda:

```cmd 
                APPLICATION
                     │
                     ▼
              ┌─────────────┐
              │ UnitOfWork  │
              └──────┬──────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
 SequelizeUnitOfWork      PrismaUnitOfWork
          │                     │
          ▼                     ▼
       Sequelize              Prisma
          │                     │
          ▼                     ▼
        MySQL               PostgreSQL
```

Y exactamente lo mismo ocurre con los repositorios:

```cmd
              UserRepository
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
 MySqlUserRepository   PostgreSqlUserRepository
          │                   │
          ▼                   ▼
        MySQL             PostgreSQL
```

Ese es el punto de desacoplar.

UnitOfWork no es una herramienta exclusiva de MySQL. Es el contrato común que permite que cada infraestructura implemente su propia forma de manejar transacciones.

Y ahora sí, la frase que debes recordar:

Application define qué necesita (UnitOfWork, UserRepository, RoleRepository); Infrastructure decide cómo hacerlo (Sequelize + MySQL, Prisma + PostgreSQL, etc.). Al cambiar de BD, cambias las implementaciones, no el caso de uso.