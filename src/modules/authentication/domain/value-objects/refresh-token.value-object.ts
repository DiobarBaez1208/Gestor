/**
 * Value Object que representa el refresh token
 * asociado a una sesión.
 *
 * El dominio solamente necesita conocerlo como
 * un valor válido de autenticación.
 *
 * No conoce JWT, jsonwebtoken, HTTP ni ninguna
 * tecnología externa.
 */
export class RefreshToken {

    private constructor(
        private readonly value: string,
    ) {}

    /**
     * Crea un RefreshToken válido.
     */
    static create(value: string): RefreshToken {

        const normalizedValue = value.trim();

        if (!normalizedValue) {
            throw new Error(
                "Refresh token cannot be empty.",
            );
        }

        return new RefreshToken(normalizedValue);
    }

    /**
     * Devuelve el valor primitivo.
     */
    getValue(): string {
        return this.value;
    }

    /**
     * Compara dos RefreshToken por valor.
     */
    equals(other: RefreshToken): boolean {
        return this.value === other.value;
    }

    /**
     * Representación textual del Value Object.
     */
    toString(): string {
        return this.value;
    }
}