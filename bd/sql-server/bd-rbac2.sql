-- Cambia el contexto actual a la nueva base de datos.
-- A partir de aquí, los CREATE TABLE, INSERT, etc.
-- se ejecutarán dentro de "diobase".
USE spec; 
GO

-- | ============================================================================
-- | RBAC2 — RESTRICCIONES Y SEPARACIÓN DE RESPONSABILIDADES
-- | Extiende RBAC1 mediante restricciones que controlan cómo pueden asignarse
-- | y utilizarse los roles, incluyendo reglas de separación de responsabilidades
-- | para evitar combinaciones de privilegios incompatibles.
-- | ============================================================================

-- ============================================================================
-- role_conflicts — RESTRICCIONES (Separation of Duties, SoD)
-- Define pares de roles incompatibles para evitar que determinadas
-- combinaciones de privilegios sean asignadas al mismo usuario.
-- ============================================================================

-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS role_conflicts; 
GO

-- Crea la tabla de conflictos entre roles.
CREATE TABLE role_conflicts (
    -- FK hacia el primer rol del par incompatible.
    role_a_id BIGINT NOT NULL,
    -- FK hacia el segundo rol del par incompatible.
    role_b_id BIGINT NOT NULL,
    -- Motivo de la incompatibilidad.
    reason VARCHAR(255) NULL,
    -- Fecha de creación del conflicto.
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Evita duplicar el mismo par de roles.
    CONSTRAINT PK_role_conflicts PRIMARY KEY (role_a_id, role_b_id),
    -- Relación con el primer rol.
    CONSTRAINT FK_role_conflicts_a FOREIGN KEY (role_a_id) REFERENCES roles(id) ON DELETE CASCADE,
    -- Relación con el segundo rol.
    CONSTRAINT FK_role_conflicts_b FOREIGN KEY (role_b_id) REFERENCES roles(id) ON DELETE CASCADE
); 
GO

-- Índice para búsquedas por el primer rol.
CREATE INDEX IX_role_conflicts_a ON role_conflicts(role_a_id); 
GO

-- Índice para búsquedas por el segundo rol.
CREATE INDEX IX_role_conflicts_b ON role_conflicts(role_b_id); 
GO

-- Convención: almacenar siempre el par con role_a_id < role_b_id.


-- ============================================================================
-- SESSIONS
-- Registro de sesiones de autenticación iniciadas por los usuarios.
-- Cada sesión identifica al usuario, el dispositivo utilizado y los tokens
-- asociados al acceso, permitiendo controlar su vigencia y renovación.
-- ============================================================================

-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS sessions; 
GO

-- Crea la tabla de sesiones.
CREATE TABLE sessions (
    -- Identificador único de la sesión.
    id VARCHAR(64) NOT NULL CONSTRAINT PK_sessions PRIMARY KEY,
    -- FK hacia el usuario propietario.
    user_id BIGINT NOT NULL,
    -- FK hacia el dispositivo utilizado.
    device_id BIGINT NOT NULL,
    -- Hash del access token.
    access_token_hash VARCHAR(255) NOT NULL,
    -- Hash del refresh token.
    refresh_token_hash VARCHAR(255) NOT NULL,
    -- Fecha de inicio de sesión.
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Fecha de expiración del access token.
    expires_at DATETIME2 NOT NULL,
    -- Fecha de expiración del refresh token.
    refresh_expires_at DATETIME2 NOT NULL,
    -- Relación con el usuario.
    CONSTRAINT FK_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    -- Relación con el dispositivo.
    CONSTRAINT FK_sessions_device FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    -- Evita access tokens duplicados.
    CONSTRAINT UQ_sessions_access_token UNIQUE (access_token_hash),
    -- Evita refresh tokens duplicados.
    CONSTRAINT UQ_sessions_refresh_token UNIQUE (refresh_token_hash)
); 
GO

-- Índice para buscar sesiones por usuario.
CREATE INDEX IX_sessions_user ON sessions(user_id); 
GO

-- Índice para buscar sesiones por dispositivo.
CREATE INDEX IX_sessions_device ON sessions(device_id); 
GO



-- ============================================================================
-- SESSION_ROLES
-- Relaciona sesiones con los roles activos durante cada sesión, permitiendo
-- controlar dinámicamente qué roles puede utilizar un usuario en ese momento.
-- ============================================================================

-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS session_roles; 
GO

-- Crea la relación entre sesiones y roles.
CREATE TABLE session_roles (
    -- FK hacia la sesión.
    session_id VARCHAR(64) NOT NULL,
    -- FK hacia el rol activado.
    role_id BIGINT NOT NULL,
    -- Fecha de activación del rol.
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Evita duplicar un rol dentro de la misma sesión.
    CONSTRAINT PK_session_roles PRIMARY KEY (session_id, role_id),
    -- Relación con la sesión.
    CONSTRAINT FK_session_roles_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    -- Relación con el rol.
    CONSTRAINT FK_session_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
GO

-- Índice para búsquedas por rol.
CREATE INDEX IX_session_roles_role ON session_roles(role_id); 
GO
