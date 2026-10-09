-- |============================================================================
-- | RBAC (ROLE-BASED ACCESS CONTROL)
-- | Implementación del modelo de control de acceso basado en roles (RBAC),
-- | utilizado para gestionar de forma centralizada los permisos del sistema.
-- | Los permisos se asignan a roles y los roles se asignan a usuarios,
-- | permitiendo controlar qué acciones puede realizar cada usuario según
-- | las responsabilidades y capacidades definidas para su rol.
-- ============================================================================

-- Cambia el contexto actual a la nueva base de datos.
-- A partir de aquí, los CREATE TABLE, INSERT, etc.
-- se ejecutarán dentro de "diobase".
USE spec; 
GO


-- | ============================================================================
-- | RBAC0 — ROLES Y ASIGNACIÓN DE USUARIOS
-- | Define los elementos básicos del control de acceso basado en roles:
-- | usuarios, roles, permisos y las relaciones que determinan qué capacidades
-- | tiene cada usuario dentro del sistema.
-- ============================================================================


-- ============================================================================
-- PERMISSIONS (RBAC)
-- Catálogo de permisos atómicos que representan la unidad mínima de acceso
-- que puede asignarse a un rol. Cada permiso define una acción concreta
-- sobre un recurso, módulo, entidad o campo del sistema.
-- ============================================================================

-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS permissions; 
GO

-- Crea la tabla de permisos.
CREATE TABLE permissions (
    -- PK autoincremental.
    id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_permissions PRIMARY KEY,
    -- Tipo de recurso sobre el que aplica el permiso.
    resource_type VARCHAR(20) NOT NULL,
    -- Recurso lógico.
    resource VARCHAR(100) NOT NULL,
    -- Acción permitida.
    action VARCHAR(50) NOT NULL,
    -- Descripción del permiso.
    description VARCHAR(255) NULL,
    -- Fecha de creación.
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Fecha de última modificación.
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Evita permisos duplicados con la misma semántica.
    CONSTRAINT UQ_permissions UNIQUE (resource_type, resource, action),
    -- Reemplaza el ENUM de MySQL.
    CONSTRAINT CK_permissions_resource_type CHECK (resource_type IN ('module', 'entity', 'action', 'field'))
); 
GO


-- ============================================================================
-- ROLE_PERMISSIONS (N–M)
-- Tabla intermedia que relaciona roles con permisos y define las capacidades
-- que tiene cada rol. Permite que un rol tenga múltiples permisos y que un
-- mismo permiso pueda asignarse a múltiples roles.
-- ============================================================================

-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS role_permissions 
GO

-- Crea la relación entre roles y permisos.
CREATE TABLE role_permissions (
    -- FK hacia roles.
    role_id BIGINT NOT NULL,
    -- FK hacia permissions.
    permission_id BIGINT NOT NULL,
    -- Fecha de asignación del permiso.
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Evita asignar el mismo permiso dos veces al mismo rol.
    CONSTRAINT PK_role_permissions PRIMARY KEY (role_id, permission_id),
    -- Relación con roles.
    CONSTRAINT FK_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    -- Relación con permisos.
    CONSTRAINT FK_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
); 
GO

-- Índice para buscar rápidamente los roles de un permiso.
CREATE INDEX IX_role_permissions_permission ON role_permissions(permission_id); 
GO