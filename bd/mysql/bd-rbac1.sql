USE spec;

-- ============================================================================
-- RBAC1 — JERARQUÍAS DE ROLES
-- Extiende RBAC0 mediante relaciones jerárquicas entre roles, permitiendo
-- que un rol herede los permisos de otros roles dentro de una estructura
-- de superioridad y herencia de capacidades.
-- ============================================================================

-- ============================================================================
-- ROLE_HIERARCHY
-- Define relaciones de herencia entre roles dentro del modelo RBAC.
-- Permite construir jerarquías donde un rol padre hereda los permisos de sus roles hijo.
-- Permite representar relaciones jerárquicas y aplicar herencia transitiva de permisos.
-- Relación: roles (1) ──── (N) role_hierarchy (N) ──── (1) roles.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS role_hierarchy;
-- Crea la tabla intermedia de jerarquía entre roles.
CREATE TABLE role_hierarchy (
    parent_role_id BIGINT NOT NULL,                              -- FK ↦ roles.id; rol superior que hereda permisos de su hijo.
    child_role_id BIGINT NOT NULL,                               -- FK ↦ roles.id; rol inferior cuyos permisos se heredan.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- Auditoría: alta del vínculo jerárquico.
    CONSTRAINT PK_role_hierarchy PRIMARY KEY (parent_role_id, child_role_id), -- Evita duplicar la relación padre-hijo.
    CONSTRAINT FK_role_hierarchy_parent FOREIGN KEY (parent_role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT FK_role_hierarchy_child FOREIGN KEY (child_role_id) REFERENCES roles(id) ON DELETE CASCADE,
    INDEX IX_role_hierarchy_child (child_role_id),             -- Acelera búsquedas por hijo (quiénes son sus padres).
    INDEX IX_role_hierarchy_parent (parent_role_id)            -- Acelera búsquedas por padre (quiénes son sus hijos).
) ENGINE=InnoDB;

-- ============================================================================
-- V_USER_RBAC_PERMISSIONS_H
-- Vista de permisos efectivos por usuario considerando la jerarquía de roles.
-- Expande recursivamente los roles heredados para obtener sus permisos efectivos.
-- Permite evaluar permisos asignados directamente al usuario o heredados por jerarquía.
-- Relación: users → user_roles → role_hierarchy → role_permissions → permissions.
-- ============================================================================
-- Elimina la vista si ya existe.
DROP VIEW IF EXISTS v_user_rbac_permissions_h;
-- Crea la vista de permisos efectivos considerando la jerarquía.
CREATE VIEW v_user_rbac_permissions_h AS
WITH RECURSIVE roles_of_user AS (
    SELECT ur.user_id, ur.role_id                              -- Roles asignados directamente al usuario.
    FROM user_roles ur
    UNION
    SELECT r.user_id, rh.parent_role_id                        -- Sube a padres recursivamente (herencia).
    FROM roles_of_user r
    JOIN role_hierarchy rh ON rh.child_role_id = r.role_id
)
SELECT
    rou.user_id,                                                -- Usuario.
    p.resource_type,                                            -- Tipo de recurso del permiso.
    p.resource,                                                 -- Recurso lógico.
    p.action                                                    -- Permiso efectivo vía rol directo o heredado.
FROM roles_of_user rou
JOIN role_permissions rp ON rp.role_id = rou.role_id
JOIN permissions p ON p.id = rp.permission_id;