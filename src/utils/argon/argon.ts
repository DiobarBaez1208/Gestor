import type { HashOptions as Argon2Options } from "argon2";
import {winstonLogger} from "../winston/winston.js";
import argon2 from "argon2";

/**
 * Representa el tipo de error que registramos cuando una entrada no válida
 * llega a la función de hashing.
 *
 * ¿Por qué usar unknown?
 *   - Permite registrar cualquier cosa enviada por el cliente o el backend.
 *   - unknown obliga a validación explícita (no es un any disfrazado).
 */
interface ValidationError {
    input: unknown;
}

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  GENERATE HASH — Argon2id
 * ──────────────────────────────────────────────────────────────────────────────
 * Genera un hash seguro usando Argon2id, el algoritmo recomendado por OWASP.
 *
 * Ventajas de Argon2id:
 *   - Alta resistencia a ataques GPU.
 *   - Configurable en memoria, tiempo y paralelismo.
 *   - Más seguro y moderno que bcrypt.
 *
 * Retorna:
 *   ✔ string → si se generó correctamente.
 *   ✔ null → si hubo cualquier error o datos inválidos.
 */
const generateHash = async (password: string): Promise<string | null> => {
    if (typeof password !== "string" || password.trim().length === 0) {
        const errorMsg =
            "Validation error: Password must be a non-empty string.";

        winstonLogger.warn(errorMsg, {
            input: password
        } satisfies ValidationError);

        return null;
    }

    try {
        /**
         * Configuración correcta para Argon2id.
         *
         * type debe ser tipado así:
         *   type: typeof argon2.argon2id
         *
         * Porque Argon2 no expone un tipo Argon2Type,
         * sino valores numéricos exportados como constantes.
         */
        const options: Argon2Options & { type: typeof argon2.argon2id } = {
            type: argon2.argon2id,
            memoryCost: 2 ** 17, // ~128MB
            timeCost: 4,         // 4 iteraciones
            parallelism: 2       // recomendado para servidores modernos
        };

        const hashed: string = await argon2.hash(password, options);

        return hashed;
    } catch (error) {
        const err = error as Error;

        winstonLogger.error(
            `Error generating hash with Argon2: ${err.message}`,
            { stack: err.stack }
        );

        return null;
    }
};

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  VERIFY PASSWORD
 * ──────────────────────────────────────────────────────────────────────────────
 * Verifica un password plano contra un hash Argon2id.
 *
 * Retorna:
 *   ✔ true → si coincide
 *   ✔ false → si NO coincide o si ocurre un error.
 *
 * Usamos try/catch porque verify() también puede lanzar.
 */
const verifyPassword = async (hash: string, inputPassword: string): Promise<boolean> => {
    try {
        const isValid: boolean = await argon2.verify(hash, inputPassword);
        return isValid;
    } catch (error) {
        const err = error as Error;

        winstonLogger.error(`Error verifying password: ${err.message}`, {
            stack: err.stack
        });

        return false;
    }
};


export { verifyPassword, generateHash }