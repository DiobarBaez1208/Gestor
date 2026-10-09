USE spec;


-- |============================================================================
-- | ABAC (ATTRIBUTE-BASED ACCESS CONTROL)
-- | Implementación del modelo de control de acceso basado en atributos (ABAC),
-- | utilizado para gestionar de forma dinámica y contextual las decisiones de
-- | autorización del sistema.
-- | Las políticas de acceso se evalúan utilizando atributos relacionados con
-- | el sujeto (usuario), el objeto (recurso) y el entorno de la solicitud,
-- | permitiendo determinar si una acción debe ser permitida o denegada según
-- | las condiciones definidas para cada política.
-- |
-- | A diferencia de RBAC, donde el acceso depende principalmente de los roles
-- | asignados a los usuarios, ABAC permite establecer reglas más específicas
-- | y flexibles basadas en atributos, contexto y condiciones de acceso.
-- |
-- | El modelo ABAC permite implementar controles como restricciones por
-- | propietario del recurso, empresa, región, horario, dirección IP, estado
-- | del recurso, canal de acceso u otras características relevantes para la
-- | decisión de autorización.
-- ============================================================================ 


-- ============================================================================
-- 🔒 ABAC: ATTRIBUTES STORAGE (opcional)
-- Almacenes genéricos de atributos dinámicos para PDP
-- (si no se obtienen directamente de tablas de dominio).
-- ============================================================================
--
-- Esta tabla almacena atributos dinámicos asociados a los usuarios,
-- permitiendo que el motor PDP (Policy Decision Point) pueda consultar
-- información que no necesariamente forma parte de las tablas principales
-- del dominio de la aplicación.
--
-- Cada registro representa un atributo identificado mediante una clave
-- lógica y asociado a un usuario específico.
--
-- El valor del atributo se almacena en formato JSON, permitiendo representar
-- valores escalares, objetos o listas sin necesidad de crear una columna
-- específica para cada atributo.
--
-- Ejemplos de atributos:
--
--   • company_id     → Identificador de la empresa del usuario.
--   • mfa_verified   → Indica si el usuario completó MFA.
--   • region         → Región asociada al usuario.
--
-- La combinación de "user_id" y "attr_key" garantiza que un usuario no
-- pueda tener múltiples valores para la misma clave de atributo.
--
-- La relación con "users" utiliza ON DELETE CASCADE, por lo que los
-- atributos asociados serán eliminados automáticamente cuando se elimine
-- el usuario propietario.
--
-- ============================================================================
-- Tabla: subject_attributes
-- Propósito: Almacenar atributos dinámicos asociados a usuarios.
-- Modelo: ABAC (Attribute-Based Access Control).
-- Integración: Proporciona atributos al PDP durante la evaluación de políticas.
-- Dependencia: users(id).
-- ============================================================================

-- ============================================================================
-- ABAC: SUBJECT_ATTRIBUTES
-- Almacén genérico de atributos asociados a los sujetos del sistema.
-- Permite almacenar atributos utilizados por las políticas ABAC para evaluar
-- las características del usuario que realiza una acción.
-- Relación: Un usuario puede tener múltiples atributos mediante user_id.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS subject_attributes;
-- Crea el almacén genérico de atributos de usuario.
CREATE TABLE subject_attributes (
    user_id BIGINT NOT NULL,                                      -- Identificador del usuario propietario del atributo.
    attr_key VARCHAR(100) NOT NULL,                            -- Nombre lógico del atributo (p.ej., company_id, mfa_verified, region).
    attr_value JSON NOT NULL,                                  -- Valor del atributo almacenado en formato JSON. Puede representar un valor escalar, objeto o lista.
    CONSTRAINT PK_subject_attributes PRIMARY KEY (user_id, attr_key), -- Clave primaria compuesta. Garantiza un único atributo por clave para cada usuario.
    CONSTRAINT FK_subject_attributes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Relación con el usuario propietario. Los atributos se eliminan automáticamente al eliminar el usuario.
) ENGINE=InnoDB;


-- ============================================================================
-- 🔒 ABAC: OBJECT ATTRIBUTES
-- Almacén genérico de atributos dinámicos asociados a recursos u objetos.
-- ============================================================================
--
-- Esta tabla almacena atributos dinámicos asociados a objetos o recursos
-- que serán utilizados durante la evaluación de políticas ABAC por el PDP
-- (Policy Decision Point).
--
-- A diferencia de los atributos del sujeto, que representan características
-- del usuario o entidad que solicita acceso, esta tabla almacena atributos
-- relacionados con el RECURSO sobre el cual se está realizando la operación.
--
-- Cada recurso se identifica mediante la combinación de:
--
--   • object_type → Clase lógica del recurso.
--   • object_id   → Identificador lógico del recurso.
--
-- Cada atributo se identifica mediante "attr_key" y su valor se almacena
-- en formato JSON, permitiendo representar valores escalares, objetos o
-- listas sin necesidad de modificar el esquema de la tabla.
--
-- Ejemplos de tipos de objetos:
--
--   • shipping_order → Orden de envío.
--   • invoice        → Factura.
--   • document       → Documento.
--   • user           → Usuario.
--
-- Ejemplos de atributos:
--
--   • owner_id → Identificador del propietario.
--   • locked   → Indica si el recurso se encuentra bloqueado.
--   • market   → Mercado o región asociada al recurso.
--
-- La clave primaria compuesta garantiza que un mismo objeto no pueda tener
-- más de un valor para la misma clave de atributo.
--
-- El uso de VARCHAR para "object_id" permite soportar diferentes dominios
-- donde los identificadores pueden ser numéricos, UUID, códigos alfanuméricos
-- u otros identificadores representados como texto.
--
-- ============================================================================
-- Tabla: object_attributes
-- Propósito: Almacenar atributos dinámicos asociados a recursos u objetos.
-- Modelo: ABAC (Attribute-Based Access Control).
-- Integración: Proporciona atributos del recurso al PDP durante la evaluación
--              de políticas ABAC.
-- ============================================================================

-- ============================================================================
-- ABAC: OBJECT_ATTRIBUTES
-- Almacén genérico de atributos asociados a los objetos del sistema.
-- Permite almacenar atributos utilizados por las políticas ABAC para evaluar
-- las características del recurso sobre el que se realiza una acción.
-- Relación: Un objeto puede tener múltiples atributos mediante object_type y object_id.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS object_attributes;
-- Crea el almacén genérico de atributos de objetos.
CREATE TABLE object_attributes (
    object_type VARCHAR(100) NOT NULL,                                  -- Clase lógica del recurso (p.ej., shipping_order, invoice, document).
    object_id VARCHAR(100) NOT NULL,                                    -- Identificador lógico del objeto. Se utiliza VARCHAR para permitir diferentes formatos de identificador.
    attr_key VARCHAR(100) NOT NULL,                                     -- Nombre lógico del atributo del recurso (p.ej., owner_id, locked, market).
    attr_value JSON NOT NULL,                                            -- Valor del atributo almacenado en formato JSON. Puede representar un valor escalar, objeto o lista.
    CONSTRAINT PK_object_attributes PRIMARY KEY (object_type, object_id, attr_key), -- Clave primaria compuesta. Garantiza un único atributo por clave para cada objeto.
    CONSTRAINT CK_object_attributes_attr_value_json CHECK (JSON_VALID(attr_value)) -- Verifica que el valor almacenado tenga una estructura JSON válida.
) ENGINE=InnoDB;



-- ============================================================================
-- 🔒 ABAC: ENVIRONMENT ATTRIBUTES
-- Almacén genérico de atributos dinámicos asociados al contexto de una petición.
-- ============================================================================
--
-- Esta tabla almacena atributos relacionados con el ENTORNO en el que se
-- realiza una solicitud de acceso. Estos atributos pueden ser utilizados
-- durante la evaluación de políticas ABAC por el PDP (Policy Decision Point).
--
-- A diferencia de los atributos del sujeto y del objeto, los atributos de
-- entorno representan información contextual de la petición, como la
-- dirección IP, hora, canal de acceso, país o cualquier otra característica
-- disponible durante la solicitud.
--
-- Cada conjunto de atributos se identifica mediante "request_id", que permite
-- correlacionar la información con una petición concreta de la API, gateway,
-- NGINX u otro componente de infraestructura.
--
-- Ejemplos de atributos de entorno:
--
--   • ip       → Dirección IP desde la que se originó la petición.
--   • hour     → Hora en la que se realizó la solicitud.
--   • channel  → Canal utilizado para acceder al sistema.
--   • country  → País asociado al contexto de la petición.
--
-- El campo "attr_value" utiliza formato JSON para permitir almacenar valores
-- escalares, objetos o listas sin necesidad de modificar el esquema.
--
-- Ejemplos de valores:
--
--   • "10.0.0.1" → Dirección IP.
--   • 14         → Hora del día.
--   • "web"      → Canal de acceso.
--   • ["MX","US"] → Lista de países.
--
-- La clave primaria compuesta garantiza que una misma petición no pueda
-- contener más de un valor para la misma clave de atributo.
--
-- El campo "created_at" proporciona información de auditoría sobre el
-- momento en que los atributos fueron capturados.
--
-- ============================================================================
-- Tabla: environment_attributes
-- Propósito: Almacenar atributos dinámicos del contexto de una petición.
-- Modelo: ABAC (Attribute-Based Access Control).
-- Integración: Proporciona atributos del entorno al PDP durante la evaluación
--              de políticas ABAC.
-- ============================================================================

-- ============================================================================
-- ABAC: ENVIRONMENT_ATTRIBUTES
-- Almacén genérico de atributos asociados al contexto de ejecución.
-- Permite almacenar atributos utilizados por las políticas ABAC para evaluar
-- las características del entorno en el que se realiza una acción.
-- Relación: Una petición puede tener múltiples atributos mediante request_id.
-- ============================================================================
-- Elimina la tabla si ya existe.
DROP TABLE IF EXISTS environment_attributes;
-- Crea el almacén genérico de atributos de entorno.
CREATE TABLE environment_attributes (
    request_id VARCHAR(100) NOT NULL,                                  -- Identificador de la petición. Permite correlacionar los atributos con una solicitud concreta de la API, gateway, NGINX u otro componente de infraestructura.
    attr_key VARCHAR(100) NOT NULL,                                     -- Nombre lógico del atributo de entorno (p.ej., ip, hour, channel, country).
    attr_value JSON NOT NULL,                                           -- Valor del atributo almacenado en formato JSON. Puede representar un valor escalar, objeto o lista.
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,              -- Fecha y hora en que se capturó el atributo.
    CONSTRAINT PK_environment_attributes PRIMARY KEY (request_id, attr_key), -- Clave primaria compuesta. Garantiza un único atributo por clave para cada petición.
    CONSTRAINT CK_environment_attributes_attr_value_json CHECK (JSON_VALID(attr_value)) -- Verifica que el valor almacenado tenga una estructura JSON válida.
) ENGINE=InnoDB;