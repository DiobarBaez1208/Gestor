import type { SessionId } from "../../../domain/value-objects/session-id.value-object";

/**
 * Representa la intención de cerrar
 * una sesión de autenticación.
 */
export interface LogoutCommand {

    /**
     * Identificador de la sesión
     * que se desea cerrar.
     */
    sessionId: SessionId;
}