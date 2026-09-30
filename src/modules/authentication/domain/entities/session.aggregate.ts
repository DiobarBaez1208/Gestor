import { SessionId } from "../value-objects/session-id.value-object";
import { RefreshToken } from "../value-objects/refresh-token.value-object";

/**
 * Aggregate Root que representa una sesión
 * de autenticación.
 *
 * La entidad es responsable de mantener las
 * reglas relacionadas con el estado de la sesión.
 */
export class Session {

    private constructor(
        private readonly id: SessionId,
        private readonly userId: number,
        private readonly refreshToken: RefreshToken,
        private readonly createdAt: Date,
        private readonly expiresAt: Date,
        private revokedAt: Date | null,
    ) { }

    /**
     * Factory Method utilizado para crear
     * una nueva sesión.
     */
    static create(
        id: SessionId,
        userId: number,
        refreshToken: RefreshToken,
        expiresAt: Date,
    ): Session {

        if (!Number.isInteger(userId) || userId <= 0) {
            throw new Error(
                "User ID must be a positive integer.",
            );
        }

        const now = new Date();

        if (expiresAt <= now) {
            throw new Error(
                "Session expiration must be in the future.",
            );
        }

        return new Session(
            id,
            userId,
            refreshToken,
            now,
            expiresAt,
            null,
        );
    }

    /**
     * Reconstruye una sesión existente
     * a partir de su estado persistido.
     *
     * No crea una nueva sesión ni modifica
     * las fechas o el estado almacenado.
     */
    static rehydrate(
        id: SessionId,
        userId: number,
        refreshToken: RefreshToken,
        createdAt: Date,
        expiresAt: Date,
        revokedAt: Date | null,
    ): Session {

        return new Session(
            id,
            userId,
            refreshToken,
            createdAt,
            expiresAt,
            revokedAt,
        );
    }

    /**
     * Revoca la sesión.
     *
     * Una sesión revocada no vuelve a estar activa.
     */
    revoke(): void {

        if (this.revokedAt !== null) {
            return;
        }

        this.revokedAt = new Date();
    }

    /**
     * Determina si la sesión fue revocada.
     */
    isRevoked(): boolean {
        return this.revokedAt !== null;
    }

    /**
     * Determina si la sesión ya expiró.
     */
    isExpired(): boolean {
        return new Date() >= this.expiresAt;
    }

    /**
     * Determina si la sesión continúa activa.
     *
     * Una sesión está activa únicamente cuando
     * no ha sido revocada y no ha expirado.
     */
    isActive(): boolean {
        return !this.isRevoked()
            && !this.isExpired();
    }

    /**
     * Obtiene el identificador de la sesión.
     */
    getId(): SessionId {
        return this.id;
    }

    /**
     * Obtiene el identificador del usuario
     * propietario de la sesión.
     */
    getUserId(): number {
        return this.userId;
    }

    /**
     * Obtiene el refresh token de la sesión.
     */
    getRefreshToken(): RefreshToken {
        return this.refreshToken;
    }

    /**
     * Obtiene la fecha de creación.
     */
    getCreatedAt(): Date {
        return this.createdAt;
    }

    /**
     * Obtiene la fecha de expiración.
     */
    getExpiresAt(): Date {
        return this.expiresAt;
    }

    /**
     * Obtiene la fecha de revocación.
     *
     * Será null mientras la sesión no haya
     * sido revocada.
     */
    getRevokedAt(): Date | null {
        return this.revokedAt;
    }
}