USE spec;

-- ============================================================================
-- RBAC3 — SESIONES + DISPOSITIVOS + JERARQUÍA + SoD
-- Calcula los permisos efectivos de una sesión a partir de sus roles activos,
-- incluyendo la herencia de roles y el contexto del dispositivo utilizado.
-- ============================================================================

-- ============================================================================
-- V_SESSION_RBAC_PERMISSIONS_H
-- Vista de permisos efectivos por sesión considerando la jerarquía de roles.
-- Permite obtener los permisos de los roles activos dentro de una sesión.
-- Incluye los permisos heredados mediante la jerarquía de roles.
-- Incluye el usuario y dispositivo asociados a la sesión.
-- Relación: sessions → session_roles → role_hierarchy → role_permissions → permissions.
-- ============================================================================

-- Elimina la vista si ya existe.
DROP VIEW IF EXISTS v_session_rbac_permissions_h;

-- Crea la vista de permisos efectivos por sesión.
CREATE VIEW v_session_rbac_permissions_h AS

-- Obtiene los roles activos y sus roles padre de forma recursiva.
WITH RECURSIVE active_roles AS (

    -- Roles activados directamente en la sesión.
    SELECT
        sr.session_id,
        sr.role_id
    FROM session_roles sr

    UNION ALL

    -- Obtiene los roles padre mediante la jerarquía.
    SELECT
        ar.session_id,
        rh.parent_role_id
    FROM active_roles ar
    INNER JOIN role_hierarchy rh
        ON rh.child_role_id = ar.role_id
)

-- Obtiene los permisos efectivos de la sesión.
SELECT DISTINCT
    ar.session_id,
    s.user_id,
    s.device_id,
    p.resource_type,
    p.resource,
    p.action
FROM active_roles ar

-- Relaciona los roles con sus permisos.
INNER JOIN role_permissions rp
    ON rp.role_id = ar.role_id

-- Obtiene la información del permiso.
INNER JOIN permissions p
    ON p.id = rp.permission_id

-- Obtiene el usuario y dispositivo de la sesión.
INNER JOIN sessions s
    ON s.id = ar.session_id;