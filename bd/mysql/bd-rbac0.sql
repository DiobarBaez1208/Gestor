USE spec;

-- |============================================================================
-- | RBAC (ROLE-BASED ACCESS CONTROL)
-- | Implementación del modelo de control de acceso basado en roles (RBAC),
-- | utilizado para gestionar de forma centralizada los permisos del sistema.
-- | Los permisos se asignan a roles y los roles se asignan a usuarios,
-- | permitiendo controlar qué acciones puede realizar cada usuario según
-- | las responsabilidades y capacidades definidas para su rol.
-- ============================================================================


-- ============================================================================
-- PERMISSIONS (RBAC)
-- Catálogo de permisos atómicos: unidad mínima de capacidad otorgable.
-- Define los recursos y acciones que pueden ser autorizados dentro del sistema.
-- Permite construir las capacidades que posteriormente se asignan a los roles.
-- Relación: Un permiso puede ser asignado a múltiples roles mediante role_permissions.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS permissions;
-- Crea la tabla de permisos.
CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT NOT NULL,                                      -- PK del permiso.
    resource_type ENUM('module','entity','action','field') NOT NULL,    -- Capa lógica: 'module'|'entity'|'action'|'field'.
    resource VARCHAR(100) NOT NULL,                                      -- Recurso lógico (p.ej., 'shipping_orders','inventory').
    action VARCHAR(50) NOT NULL,                                         -- Operación (p.ej., 'read','create','update','delete','access','export').
    description VARCHAR(255),                                            -- Documentación humana (qué permite exactamente).
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,              -- Auditoría: alta del permiso.
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP               -- Auditoría: última modificación.
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PK_permissions PRIMARY KEY (id),                           -- PK del permiso.
    CONSTRAINT UQ_permissions UNIQUE (resource_type, resource, action)   -- Evita duplicar permisos con misma semántica.
) ENGINE=InnoDB;

-- ============================================================================
-- ROLE_PERMISSIONS (N–M)
-- Relación muchos-a-muchos entre roles y permisos dentro del modelo RBAC.
-- Permite asignar múltiples permisos a un rol y reutilizar un mismo permiso
-- en múltiples roles.
-- Relación: roles (1) ──── (N) role_permissions (N) ──── (1) permissions.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS role_permissions;
-- Crea la tabla intermedia de roles y permisos.
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,                                      -- FK ↦ roles.id; rol que recibe la capacidad.
    permission_id BIGINT NOT NULL,                               -- FK ↦ permissions.id; permiso otorgado al rol.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- Auditoría: cuándo se otorgó.
    CONSTRAINT PK_role_permissions PRIMARY KEY (role_id, permission_id), -- Un mismo permiso no se duplica en el mismo rol.
    CONSTRAINT FK_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT FK_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    INDEX IX_role_permissions_permission (permission_id)      -- Acelera consultas por permiso → qué roles lo tienen.
) ENGINE=InnoDB;

-- ============================================================================
-- HELPERS / VIEWS (RBAC0)
-- Vista base de permisos efectivos sin jerarquía de roles.
-- Permite obtener los permisos de un usuario mediante la relación usuario → rol → permiso.
-- Facilita las consultas de autorización sin recorrer directamente las tablas RBAC.
-- Relación: users → user_roles → roles → role_permissions → permissions.
-- ============================================================================
-- Elimina la vista si ya existe.
DROP VIEW IF EXISTS v_user_rbac_permissions;
-- Crea la vista de permisos efectivos RBAC0.
CREATE VIEW v_user_rbac_permissions AS
SELECT
    ur.user_id,                 -- Usuario dueño del permiso efectivo.
    p.resource_type,            -- Tipo de recurso del permiso.
    p.resource,                 -- Recurso lógico.
    p.action                    -- Acción permitida.
FROM user_roles ur
JOIN role_permissions rp ON rp.role_id = ur.role_id
JOIN permissions p ON p.id = rp.permission_id;