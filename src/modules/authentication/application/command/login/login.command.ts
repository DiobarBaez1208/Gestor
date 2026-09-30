/**
 * Representa la intención de iniciar sesión.
 *
 * Este objeto únicamente contiene los datos
 * necesarios para ejecutar el caso de uso Login.
 */
export interface LoginCommand {
    email: string;
    password: string;
}