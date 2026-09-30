import { AuthenticationError } from "./authentication.error";

/**
 * Error utilizado cuando las credenciales
 * proporcionadas no son válidas.
 *
 * El dominio no necesita saber si las credenciales
 * fueron verificadas mediante Argon2, bcrypt,
 * una API externa, etc.
 */
export class InvalidCredentialsError extends AuthenticationError {
    constructor() {
        super("Invalid authentication credentials.");
        this.name = "InvalidCredentialsError";
    }
}