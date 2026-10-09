-- | ============================================================================
-- | RESET
-- | Elimina y vuelve a crear la base de datos desde cero.
-- | Todo lo que exista dentro de "diobase" será eliminado.
-- | ============================================================================


-- Cambia el contexto a la base de datos del sistema "master".
-- Esto es necesario porque no podemos eliminar "diobase" mientras
-- estamos conectados a ella.
USE master; 
GO


-- Comprueba si existe una base de datos llamada "diobase".
-- DB_ID('diobase') devuelve el ID de la base si existe.
-- Si no existe, devuelve NULL.
IF DB_ID('spec') IS NOT NULL BEGIN

    -- Cambia "diobase" al modo SINGLE_USER.
    -- Esto permite que solamente exista una conexión activa.
    -- Es necesario para poder eliminar la base de datos.
    ALTER DATABASE spec
    SET SINGLE_USER

    -- Cierra inmediatamente las conexiones existentes.
    -- Si hay transacciones pendientes, SQL Server las revierte.
    -- Esto evita que otra conexión impida eliminar la base.
    WITH ROLLBACK IMMEDIATE;


    -- Elimina completamente la base de datos "diobase".
    -- Se eliminan tablas, datos, procedimientos, vistas, etc.
    DROP DATABASE spec;

END; 
GO


-- Crea nuevamente la base de datos "diobase".
CREATE DATABASE spec; 
GO


-- Cambia el contexto actual a la nueva base de datos.
-- A partir de aquí, los CREATE TABLE, INSERT, etc.
-- se ejecutarán dentro de "diobase".
USE spec; 
GO


-- |============================================================================
-- |USERS (SUBJECTS)
-- |Catálogo principal de sujetos que pueden autenticarse e interactuar
-- |con el sistema, incluyendo personas y servicios.
-- |Contiene sus datos básicos de identificación, autenticación y auditoría.
-- |============================================================================

-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS users; 
GO

-- Crea la tabla de usuarios.
CREATE TABLE users (
    -- PK autoincremental.
    id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_users PRIMARY KEY,
    -- Nombre visible.
    name VARCHAR(100) NOT NULL,
    -- Email único.
    email VARCHAR(150) NOT NULL CONSTRAINT UQ_users_email UNIQUE,
    -- Hash de contraseña.
    password VARCHAR(255) NOT NULL,
    -- Fecha de creación.
    created_at DATETIME2 NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSDATETIME(),
    -- Fecha de última modificación.
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_users_updated_at DEFAULT SYSDATETIME()
); 
GO


-- |============================================================================
-- |ROLES
-- |Catálogo de roles que agrupan permisos y definen conjuntos de capacidades
-- |dentro del sistema. Cada rol puede asignarse a uno o varios usuarios.
-- |============================================================================

-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS roles; 
GO

-- Crea la tabla de roles.
CREATE TABLE roles (
    -- PK autoincremental.
    id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_roles PRIMARY KEY,
    -- Nombre único del rol.
    name VARCHAR(100) NOT NULL,
    -- Descripción funcional del rol.
    description VARCHAR(255) NULL,
    -- Fecha de creación.
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Fecha de última modificación.
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Garantiza nombres de rol únicos.
    CONSTRAINT UQ_roles_name UNIQUE (name)
); 
GO


-- ============================================================================
-- DEVICES
-- Catálogo de dispositivos asociados a los usuarios.
-- Permite registrar, identificar y controlar los dispositivos utilizados
-- para acceder al sistema.
-- ============================================================================

-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS devices; 
GO

-- Crea la tabla de dispositivos.
CREATE TABLE devices (
    -- PK autoincremental.
    id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_devices PRIMARY KEY,
    -- FK hacia el usuario propietario.
    user_id BIGINT NOT NULL,
    -- Identificador del dispositivo.
    device_identifier VARCHAR(255) NOT NULL,
    -- Nombre del dispositivo.
    name VARCHAR(100) NULL,
    -- Tipo de dispositivo.
    device_type VARCHAR(50) NULL,
    -- Sistema operativo.
    operating_system VARCHAR(100) NULL,
    -- Indica si el dispositivo está activo.
    is_active BIT NOT NULL DEFAULT 1,
    -- Fecha de registro.
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Fecha de última modificación.
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Relación con el usuario.
    CONSTRAINT FK_devices_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    -- Evita registrar el mismo dispositivo dos veces para un usuario.
    CONSTRAINT UQ_devices_user_identifier UNIQUE (user_id, device_identifier)
); 
GO

-- Índice para buscar dispositivos por usuario.
CREATE INDEX IX_devices_user ON devices(user_id); 
GO






