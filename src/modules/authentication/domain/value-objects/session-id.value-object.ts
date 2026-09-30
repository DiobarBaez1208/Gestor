/**
 * Value Object que representa el identificador
 * único de una sesión de autenticación.
 *
 * El dominio no trabaja con un string genérico,
 * sino con un concepto específico: SessionId.
 */
export class SessionId {

    private constructor(
        private readonly value: string,
    ) {}

    /**
     * Crea un SessionId válido.
     */
    static create(value: string): SessionId {

        const normalizedValue = value.trim();

        if (!normalizedValue) {
            throw new Error(
                "Session ID cannot be empty.",
            );
        }

        return new SessionId(normalizedValue);
    }

    /**
     * Devuelve el valor primitivo del identificador.
     *
     * La conversión a string se realiza fuera del
     * comportamiento interno del Value Object.
     */
    getValue(): string {
        return this.value;
    }

    /**
     * Compara dos SessionId por valor.
     */
    equals(other: SessionId): boolean {
        return this.value === other.value;
    }

    /**
     * Representación textual del Value Object.
     */
    toString(): string {
        return this.value;
    }
}