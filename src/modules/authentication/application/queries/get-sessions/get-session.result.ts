/**
 * Representa la información devuelta
 * por el caso de uso GetSession.
 */
export interface GetSessionResult {

    /**
     * Identificador de la sesión.
     */
    id: string;

    userId: number;

    /**
     * Fecha en la que se creó la sesión.
     */
    createdAt: Date;

    /**
     * Fecha en la que expira la sesión.
     */
    expiresAt: Date;

    /**
     * Fecha de revocación.
     *
     * Será null si la sesión no ha sido revocada.
     */
    revokedAt: Date | null;

    /**
     * Indica si la sesión continúa activa.
     */
    active: boolean;
}