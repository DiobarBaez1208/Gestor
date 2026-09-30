/**
 * Representa el resultado exitoso del caso de uso Login.
 */
export interface LoginResult {
    accessToken: string;
    refreshToken: string;
}