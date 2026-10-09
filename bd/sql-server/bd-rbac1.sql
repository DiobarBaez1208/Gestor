-- Cambia el contexto actual a la nueva base de datos.
-- A partir de aquí, los CREATE TABLE, INSERT, etc.
-- se ejecutarán dentro de "diobase".
USE spec; 
GO

-- ============================================================================
-- RBAC1 — JERARQUÍAS DE ROLES
-- Extiende RBAC0 mediante relaciones jerárquicas entre roles, permitiendo
-- que un rol herede los permisos de otros roles dentro de una estructura
-- de superioridad y herencia de capacidades.
-- ============================================================================

-- ============================================================================
-- role_hierarchy — JERARQUÍAS DE ROLES
-- Define relaciones de herencia entre roles. Un rol PADRE hereda los permisos
-- de sus roles HIJO, permitiendo construir jerarquías y herencia transitiva.
-- ============================================================================

-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS role_hierarchy; 
GO

-- Crea la relación jerárquica entre roles.
CREATE TABLE role_hierarchy (
    -- FK hacia el rol padre.
    parent_role_id BIGINT NOT NULL,
    -- FK hacia el rol hijo.
    child_role_id BIGINT NOT NULL,
    -- Fecha de creación de la relación.
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Evita relaciones padre-hijo duplicadas.
    CONSTRAINT PK_role_hierarchy PRIMARY KEY (parent_role_id, child_role_id),
    -- Relación con el rol padre.
    CONSTRAINT FK_role_hierarchy_parent FOREIGN KEY (parent_role_id) REFERENCES roles(id) ON DELETE CASCADE,
    -- Relación con el rol hijo.
    CONSTRAINT FK_role_hierarchy_child FOREIGN KEY (child_role_id) REFERENCES roles(id) ON DELETE NO ACTION
); 
GO

-- Índice para buscar los padres de un rol.
CREATE INDEX IX_role_hierarchy_child ON role_hierarchy(child_role_id); 
GO

-- Índice para buscar los hijos de un rol.
CREATE INDEX IX_role_hierarchy_parent ON role_hierarchy(parent_role_id); 
GO
