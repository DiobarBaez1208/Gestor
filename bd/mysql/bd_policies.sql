USE spec;

-- ============================================================================
-- 🔒 ABAC - abac_policies — POLÍTICAS DE CONTROL DE ACCESO BASADO EN ATRIBUTOS
-- ============================================================================
--
-- Esta tabla forma parte del modelo ABAC (Attribute-Based Access Control),
-- utilizado para definir y administrar políticas de control de acceso basadas
-- en atributos relacionados con el usuario, recurso, acción y contexto.
--
-- A diferencia de RBAC, donde los permisos se determinan principalmente a
-- partir de los roles asignados a un usuario, ABAC permite establecer reglas
-- más flexibles y dinámicas. Estas políticas pueden evaluar diferentes
-- características del usuario y del recurso para determinar si una operación
-- debe ser permitida o denegada.
--
-- La tabla "abac_policies" funciona como un CATÁLOGO CENTRAL DE POLÍTICAS
-- ABAC. Cada registro representa una regla de alto nivel que indica:
--
--   • Qué acción se desea controlar.
--   • Sobre qué tipo de objeto o recurso se aplica la política.
--   • Qué efecto tendrá la política cuando sus condiciones se cumplan.
--   • Si la política se encuentra actualmente habilitada.
--   • Cuándo fue creada y cuándo fue modificada por última vez.
--
-- Ejemplos de acciones que pueden ser reguladas:
--
--   • read      → Consultar información.
--   • create    → Crear nuevos registros.
--   • update    → Modificar información existente.
--   • delete    → Eliminar información.
--   • export    → Exportar información.
--   • download  → Descargar archivos o recursos.
--
-- Los recursos sobre los que pueden aplicarse las políticas se identifican
-- mediante "target_object_type". Algunos ejemplos pueden ser:
--
--   • user      → Información de usuarios.
--   • order     → Pedidos u órdenes.
--   • invoice   → Facturas.
--   • document  → Documentos.
--   • any       → Cualquier tipo de recurso.
--
-- El campo "effect" determina el resultado de la evaluación de la política:
--
--   • permit → La operación puede ser autorizada cuando se cumplen
--              las condiciones correspondientes.
--
--   • deny   → La operación debe ser rechazada cuando se cumplen
--              las condiciones correspondientes.
--
-- El campo "is_enabled" permite activar o desactivar una política sin
-- necesidad de eliminarla físicamente. Esto facilita la administración,
-- auditoría, pruebas y mantenimiento del sistema de control de acceso.
--
-- Los campos "created_at" y "updated_at" proporcionan información de
-- auditoría, permitiendo conocer cuándo se creó una política y cuándo fue
-- modificada por última vez.
--
-- NOTA:
-- Esta tabla representa el catálogo general de políticas. Las condiciones
-- específicas que determinan cuándo una política aplica pueden almacenarse
-- y relacionarse mediante tablas ABAC adicionales, dependiendo del diseño
-- general del sistema.
--
-- En conjunto con RBAC, esta estructura permite implementar un esquema de
-- control de acceso híbrido, donde los roles proporcionan permisos generales
-- y ABAC permite aplicar restricciones más específicas basadas en atributos
-- y contexto.
--
-- ============================================================================
-- Tabla: abac_policies
-- Propósito: Catálogo y administración de políticas ABAC.
-- Modelo: ABAC (Attribute-Based Access Control).
-- Integración: Complementa el modelo RBAC existente.
-- ============================================================================


-- ============================================================================
-- ABAC: POLICIES
-- Catálogo de políticas ABAC (reglas de alto nivel).
-- Define las reglas que determinan cuándo una acción puede ser permitida
-- o denegada sobre un tipo de recurso.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS abac_policies;
-- Crea el catálogo de políticas ABAC.
CREATE TABLE abac_policies (
    id BIGINT AUTO_INCREMENT NOT NULL,                              -- PK de la política.
    name VARCHAR(120) NOT NULL,                                  -- Nombre único/legible para administración y auditoría.
    description VARCHAR(255) NULL,                               -- Breve explicación de intención/uso.
    action VARCHAR(50) NOT NULL,                                 -- Acción regulada (p.ej., 'read','update','delete','export','download').
    target_object_type VARCHAR(100) NOT NULL,                    -- Tipo lógico del recurso (p.ej., 'order','invoice','user','any').
    effect ENUM('permit', 'deny') NOT NULL DEFAULT 'permit',     -- Efecto de la política cuando se cumplen las condiciones.
    is_enabled TINYINT(1) NOT NULL DEFAULT 1,                    -- Permite activar/desactivar la política sin eliminarla.
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,       -- Fecha de creación.
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP        -- Fecha de última modificación.
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PK_abac_policies PRIMARY KEY (id),                 -- PK.
    CONSTRAINT UQ_abac_policies_name UNIQUE (name),               -- Evita nombres de políticas duplicados.
    CONSTRAINT CK_abac_policies_effect CHECK (effect IN ('permit', 'deny')) -- Solo permite los efectos permit o deny.
) ENGINE=InnoDB;

-- ============================================================================
-- 🔒 ABAC - abac_policy_conditions  — POLICY CONDITIONS
-- ============================================================================
--
-- Almacena las condiciones que determinan cuándo una política ABAC puede
-- aplicarse a una solicitud de acceso.
--
-- Cada condición está asociada a una política mediante "policy_id" y define
-- qué atributo debe evaluarse, de dónde proviene dicho atributo y qué regla
-- de comparación debe utilizarse.
--
-- El campo "target" identifica el origen del atributo:
--
--   • subject      → Usuario o entidad que solicita el acceso.
--   • object       → Recurso sobre el que se realiza la operación.
--   • environment  → Contexto de la solicitud, como hora, IP o ubicación.
--
-- "attr_path" especifica el atributo que será evaluado, mientras que
-- "operator" determina cómo se comparará con el valor almacenado en
-- "value_json".
--
-- Las condiciones pertenecientes a una misma política se evalúan de forma
-- acumulativa (AND), por lo que todas deben cumplirse para que la política
-- resulte aplicable.
--
-- El campo "ord" permite establecer un orden sugerido de evaluación y
-- facilita la depuración y el procesamiento de las condiciones.
--
-- Esta tabla complementa a "abac_policies": la política define QUÉ acción
-- se controla y cuál es su efecto, mientras que estas condiciones definen
-- BAJO QUÉ CIRCUNSTANCIAS debe aplicarse.
--
-- ============================================================================
-- Tabla: abac_policy_conditions
-- Propósito: Almacenar las condiciones utilizadas para evaluar políticas ABAC.
-- Relación: Muchas condiciones pueden pertenecer a una misma política.
-- Dependencia: abac_policies(id).
-- ============================================================================

-- ============================================================================
-- ABAC: POLICY_CONDITIONS
-- Condiciones asociadas a las políticas ABAC.
-- Define los atributos y operadores que deben evaluarse para determinar
-- si una política puede aplicarse.
-- Relación: Una política puede tener múltiples condiciones mediante policy_id.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS abac_policy_conditions;
-- Crea la tabla de condiciones ABAC.
CREATE TABLE abac_policy_conditions (
    id BIGINT AUTO_INCREMENT NOT NULL,                                      -- PK de la condición.
    policy_id BIGINT NOT NULL,                                              -- FK hacia la política ABAC propietaria.
    target VARCHAR(20) NOT NULL,                                         -- Origen del atributo que será evaluado.
    attr_path VARCHAR(150) NOT NULL,                                     -- Ruta del atributo (p.ej., subject.company_id, object.owner_id, environment.hour).
    operator VARCHAR(20) NOT NULL,                                       -- Operador utilizado para comparar el atributo.
    value_json JSON NOT NULL,                                             -- Valor de comparación almacenado en formato JSON.
    ord INT NOT NULL DEFAULT 0,                                          -- Orden sugerido de evaluación.
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,               -- Fecha de creación de la condición.
    CONSTRAINT PK_abac_policy_conditions PRIMARY KEY (id),                -- Clave primaria.
    CONSTRAINT FK_abac_policy_conditions_policy FOREIGN KEY (policy_id) REFERENCES abac_policies(id) ON DELETE CASCADE, -- Relación con la política ABAC.
    CONSTRAINT CK_abac_policy_conditions_target CHECK (target IN ('subject', 'object', 'environment')), -- Valores permitidos para target.
    CONSTRAINT CK_abac_policy_conditions_operator CHECK (operator IN ('eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains', 'overlaps', 'between', 'regex', 'cidr_contains')), -- Operadores permitidos.
    INDEX IX_abac_policy_conditions_policy (policy_id)                    -- Acelera la búsqueda de condiciones por política.
) ENGINE=InnoDB;

-- ============================================================================
-- 🔒 ABAC - abac_policy_obligations  — POLICY OBLIGATIONS
-- ============================================================================
--
-- Almacena las acciones adicionales que deben ejecutarse cuando una política
-- ABAC es aplicada y sus condiciones han sido satisfechas.
--
-- Cada obligación está asociada a una política mediante "policy_id" y define
-- una acción complementaria que puede ejecutarse como parte del proceso de
-- autorización.
--
-- Algunos ejemplos de obligaciones son:
--
--   • mask_fields            → Enmascarar campos sensibles.
--   • watermark              → Agregar una marca de agua al recurso.
--   • log_sensitive_access  → Registrar accesos sensibles con mayor detalle.
--
-- El campo "obligation" identifica el tipo de acción que debe ejecutarse,
-- mientras que "params_json" permite almacenar los parámetros necesarios
-- para realizar dicha acción.
--
-- Los parámetros pueden contener diferentes estructuras dependiendo del tipo
-- de obligación, por ejemplo una lista de campos que deben enmascararse o
-- información que debe utilizarse para generar una marca de agua.
--
-- Esta tabla complementa a "abac_policies" y "abac_policy_conditions":
-- la política define QUÉ acción se controla y su efecto, las condiciones
-- determinan CUÁNDO aplica y las obligaciones definen QUÉ ACCIONES
-- ADICIONALES deben ejecutarse como consecuencia de su aplicación.
--
-- ============================================================================
-- Tabla: abac_policy_obligations
-- Propósito: Almacenar acciones adicionales asociadas a políticas ABAC.
-- Relación: Muchas obligaciones pueden pertenecer a una misma política.
-- Dependencia: abac_policies(id).
-- ============================================================================

-- ============================================================================
-- ABAC: POLICY_OBLIGATIONS
-- Obligaciones asociadas a las políticas ABAC.
-- Define acciones adicionales que deben ejecutarse cuando una política aplica.
-- Permite almacenar parámetros específicos para cada obligación.
-- Relación: Una política puede tener múltiples obligaciones mediante policy_id.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS abac_policy_obligations;
-- Crea la tabla de obligaciones ABAC.
CREATE TABLE abac_policy_obligations (
    id BIGINT AUTO_INCREMENT NOT NULL,                                      -- PK de la obligación.
    policy_id BIGINT NOT NULL,                                              -- FK hacia la política ABAC propietaria.
    obligation VARCHAR(100) NOT NULL,                                    -- Tipo o clave de la obligación (p.ej., mask_fields, watermark, log_sensitive_access).
    params_json JSON NULL,                                                -- Parámetros adicionales de la obligación en formato JSON.
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,               -- Fecha de creación de la obligación.
    CONSTRAINT PK_abac_policy_obligations PRIMARY KEY (id),                -- Clave primaria.
    CONSTRAINT FK_abac_policy_obligations_policy FOREIGN KEY (policy_id) REFERENCES abac_policies(id) ON DELETE CASCADE, -- Relación con la política ABAC.
    CONSTRAINT CK_abac_policy_obligations_params_json CHECK (params_json IS NULL OR JSON_VALID(params_json)), -- Verifica que los parámetros sean JSON válido cuando se proporcionen.
    INDEX IX_abac_policy_obligations_policy (policy_id)                   -- Acelera la búsqueda de obligaciones por política.
) ENGINE=InnoDB;