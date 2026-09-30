import { SessionId } from "../../../domain/value-objects/session-id.value-object";

/**
 * Representa la solicitud de consultar
 * una sesión de autenticación.
 */
export interface GetSessionQuery {

    /**
     * Identificador de la sesión
     * que se desea consultar.
     */
    sessionId: SessionId;
}