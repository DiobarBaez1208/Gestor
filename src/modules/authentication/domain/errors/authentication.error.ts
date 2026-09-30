/**
 * Error base del dominio de Authentication.
 *
 * Todos los errores específicos relacionados con
 * las reglas del dominio de autenticación pueden
 * heredar de esta clase.
 */
export class AuthenticationError extends Error {

    constructor(message: string) {

        super(message);

        this.name = "AuthenticationError";

        /**
         * Necesario para conservar correctamente
         * la cadena de prototipos cuando se transpila
         * a determinados targets de JavaScript.
         */
        Object.setPrototypeOf(
            this,
            new.target.prototype,
        );
    }
}