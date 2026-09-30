import { AuthenticationError } from "./authentication.error";

/**
 * Error utilizado cuando se intenta trabajar
 * con una sesión que no existe.
 */
export class SessionNotFoundError extends AuthenticationError {

    constructor() {

        super(
            "Authentication session was not found.",
        );

        this.name = "SessionNotFoundError";
    }
}