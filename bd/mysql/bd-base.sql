-- ============================================================================
--  RESET
--  Crea la base de datos desde cero (⚠️ destruye la existente si la hay).
-- ============================================================================
DROP DATABASE IF EXISTS spec;
CREATE DATABASE spec CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE spec;

-- |============================================================================
-- |USERS (SUBJECTS)
-- |Catálogo principal de sujetos que pueden autenticarse e interactuar
-- |con el sistema, incluyendo personas y servicios.
-- |Contiene sus datos básicos de identificación, autenticación y auditoría.
-- |============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS users;
-- Crea la tabla principal de usuarios.
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT NOT NULL,                              -- PK numérica del usuario; referencia canónica en todo el modelo.
    name VARCHAR(100) NOT NULL,                                  -- Nombre visible (etiqueta humana) para UI y auditoría.
    email VARCHAR(150) NOT NULL,                                 -- Identificador único de login/notificación; debe ser único globalmente.
    password VARCHAR(255) NOT NULL,                              -- Hash de contraseña (BCrypt/Argon2). Nunca almacenar texto plano.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,     -- Auditoría: alta (cuándo se creó el registro).
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP      -- Auditoría: última modificación del registro (autoupdate).
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PK_users PRIMARY KEY (id),                        -- PK numérica del usuario.
    CONSTRAINT UQ_users_email UNIQUE (email)                     -- Garantiza que el email sea único globalmente.
) ENGINE=InnoDB;

-- ============================================================================
-- ROLES
-- Catálogo de roles del sistema.
-- Define conjuntos lógicos de permisos que pueden ser asignados a los usuarios.
-- Permite implementar control de acceso basado en roles (RBAC).
-- Relación: Un rol puede ser asignado a múltiples usuarios mediante user_roles.
-- Un rol puede tener múltiples permisos mediante role_permissions.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS roles;
-- Crea la tabla de roles.
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT NOT NULL,                              -- PK del rol; clave para relaciones con permisos y usuarios.
    name VARCHAR(100) NOT NULL,                                  -- Nombre único del rol (p.ej., 'Administrator', 'Engineer').
    description VARCHAR(255),                                    -- Descripción funcional del rol: alcance, responsabilidades.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,     -- Auditoría: alta del rol.
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP      -- Auditoría: última modificación.
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PK_roles PRIMARY KEY (id),                        -- Clave primaria del rol.
    CONSTRAINT UQ_roles_name UNIQUE (name)                       -- Garantiza unicidad semántica de nombres de rol.
) ENGINE=InnoDB;


-- ============================================================================
-- USER_ROLES
-- Relación N–M entre usuarios y roles.
-- Permite asignar uno o varios roles a cada usuario y determinar los permisos
-- asociados a dichos roles dentro del sistema.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS user_roles;
-- Crea la tabla intermedia de usuarios y roles.
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,                                      -- FK ↦ users.id; usuario que recibe el rol.
    role_id BIGINT NOT NULL,                                      -- FK ↦ roles.id; rol asignado al usuario.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- Auditoría: cuándo se asignó.
    CONSTRAINT PK_user_roles PRIMARY KEY (user_id, role_id),   -- Evita duplicar un mismo rol en un usuario.
    CONSTRAINT FK_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    INDEX IX_user_roles_role (role_id)                         -- Acelera listar usuarios por rol.
) ENGINE=InnoDB;

-- ============================================================================
-- DEVICES
-- Catálogo de dispositivos asociados a los usuarios.
-- Permite registrar, identificar y controlar los dispositivos utilizados
-- para acceder al sistema.
-- Relación: Cada dispositivo pertenece a un usuario mediante user_id.
-- Un usuario puede tener múltiples dispositivos asociados.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS devices;
-- Crea la tabla de dispositivos.
CREATE TABLE devices (
    id BIGINT NOT NULL AUTO_INCREMENT,                              -- PK autoincremental.
    user_id BIGINT NOT NULL,                                        -- FK hacia el usuario propietario.
    device_identifier VARCHAR(255) NOT NULL,                        -- Identificador del dispositivo.
    name VARCHAR(100) NULL,                                         -- Nombre del dispositivo.
    device_type VARCHAR(50) NULL,                                   -- Tipo de dispositivo.
    operating_system VARCHAR(100) NULL,                             -- Sistema operativo.
    is_active BOOLEAN NOT NULL DEFAULT TRUE,                        -- Indica si el dispositivo está activo.
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,          -- Fecha de registro.
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP            -- Fecha de última modificación.
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PK_devices PRIMARY KEY (id),                         -- Identificador único del dispositivo.
    CONSTRAINT FK_devices_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- Relación con el usuario.
    CONSTRAINT UQ_devices_user_identifier UNIQUE (user_id, device_identifier), -- Evita registrar el mismo dispositivo dos veces para un usuario.
    INDEX IX_devices_user (user_id)                                 -- Índice para buscar dispositivos por usuario.
) ENGINE=InnoDB;