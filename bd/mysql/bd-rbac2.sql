USE spec;

-- | ============================================================================
-- | RBAC2 — RESTRICCIONES Y SEPARACIÓN DE RESPONSABILIDADES
-- | Extiende RBAC1 mediante restricciones que controlan cómo pueden asignarse
-- | y utilizarse los roles, incluyendo reglas de separación de responsabilidades
-- | para evitar combinaciones de privilegios incompatibles.
-- | ============================================================================

-- ============================================================================
-- ROLE_CONFLICTS
-- Restricciones de separación de funciones (Separation of Duties, SoD).
-- Define pares de roles incompatibles que no deben ser asignados al mismo usuario.
-- Permite evitar combinaciones de privilegios que representen un riesgo de seguridad.
-- Relación: roles (1) ──── (N) role_conflicts (N) ──── (1) roles.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS role_conflicts;
-- Crea la tabla de roles incompatibles.
CREATE TABLE role_conflicts (
    role_a_id BIGINT NOT NULL,                                  -- FK ↦ roles.id; extremo A del par incompatible (convención: almacenar con a<b).
    role_b_id BIGINT NOT NULL,                                  -- FK ↦ roles.id; extremo B del par incompatible.
    reason VARCHAR(255),                                        -- Motivo/documentación de la incompatibilidad (auditoría).
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,     -- Auditoría: alta del par incompatible.
    CONSTRAINT PK_role_conflicts PRIMARY KEY (role_a_id, role_b_id), -- Evita duplicar el mismo par.
    CONSTRAINT FK_role_conflicts_a FOREIGN KEY (role_a_id) REFERENCES roles(id) ON DELETE CASCADE, -- Relación con el rol A.
    CONSTRAINT FK_role_conflicts_b FOREIGN KEY (role_b_id) REFERENCES roles(id) ON DELETE CASCADE, -- Relación con el rol B.
    INDEX IX_role_conflicts_a (role_a_id),                       -- Acelera búsquedas por extremo A.
    INDEX IX_role_conflicts_b (role_b_id)                        -- Acelera búsquedas por extremo B.
) ENGINE=InnoDB;
-- Convención recomendada en app: almacenar siempre (a,b) con a<b (usa LEAST/GREATEST) para normalizar.

-- ============================================================================
-- SESSIONS
-- Registro de sesiones de autenticación iniciadas por los usuarios.
-- Cada sesión identifica al usuario, el dispositivo utilizado y los tokens
-- asociados al acceso, permitiendo controlar su vigencia y renovación.
-- Relación: Un usuario puede tener múltiples sesiones mediante user_id.
-- Un dispositivo puede estar asociado a múltiples sesiones mediante device_id.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS sessions;
-- Crea la tabla de sesiones.
CREATE TABLE sessions (
    id BIGINT NOT NULL AUTO_INCREMENT,                              -- Identificador único de la sesión.
    user_id BIGINT NOT NULL,                                        -- FK hacia el usuario propietario.
    device_id BIGINT NOT NULL,                                      -- FK hacia el dispositivo utilizado.
    access_token_hash VARCHAR(255) NOT NULL,                        -- Hash del access token.
    refresh_token_hash VARCHAR(255) NOT NULL,                       -- Hash del refresh token.
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,          -- Fecha de inicio de sesión.
    expires_at DATETIME NOT NULL,                                   -- Fecha de expiración del access token.
    refresh_expires_at DATETIME NOT NULL,                            -- Fecha de expiración del refresh token.
    CONSTRAINT PK_sessions PRIMARY KEY (id),                         -- Identificador único de la sesión.
    CONSTRAINT FK_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- Relación con el usuario.
    CONSTRAINT FK_sessions_device FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE, -- Relación con el dispositivo.
    CONSTRAINT UQ_sessions_access_token UNIQUE (access_token_hash),  -- Evita access tokens duplicados.
    CONSTRAINT UQ_sessions_refresh_token UNIQUE (refresh_token_hash), -- Evita refresh tokens duplicados.
    INDEX IX_sessions_user (user_id),                                -- Índice para buscar sesiones por usuario.
    INDEX IX_sessions_device (device_id)                             -- Índice para buscar sesiones por dispositivo.
) ENGINE=InnoDB;

-- ============================================================================
-- SESSION_ROLES
-- Relación entre sesiones y roles activos durante cada sesión.
-- Permite determinar qué roles puede utilizar un usuario durante una sesión.
-- Permite asignar múltiples roles a una sesión y reutilizar un rol en múltiples sesiones.
-- Relación: sessions (1) ──── (N) session_roles (N) ──── (1) roles.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS session_roles;
-- Crea la relación entre sesiones y roles.
CREATE TABLE session_roles (
    session_id BIGINT NOT NULL,                                  -- FK hacia la sesión.
    role_id BIGINT NOT NULL,                                     -- FK hacia el rol activado.
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,       -- Fecha de activación del rol.
    CONSTRAINT PK_session_roles PRIMARY KEY (session_id, role_id), -- Evita duplicar un rol dentro de la misma sesión.
    CONSTRAINT FK_session_roles_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE, -- Relación con la sesión.
    CONSTRAINT FK_session_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,          -- Relación con el rol.
    INDEX IX_session_roles_role (role_id)                        -- Índice para búsquedas por rol.
) ENGINE=InnoDB;