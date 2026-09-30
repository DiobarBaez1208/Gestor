// Este contract representa la capacidad de trabajar con tokens de autenticación.

export interface TokenPayload {
    userId: number;
    roleId: number;
}

export interface TokenService {

    generateAccessToken(
        payload: TokenPayload,
    ): string;

    verifyAccessToken(
        token: string,
    ): TokenPayload;
}