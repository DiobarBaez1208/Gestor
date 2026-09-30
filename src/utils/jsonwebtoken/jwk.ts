import type { JwtPayload, Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

/**
 * Validación estricta de la clave secreta para JWT
 */
const secretKey: Secret = process.env.JWT_SECRET ?? ""

if (!secretKey || typeof secretKey !== "string") {
    throw new Error("JWT secret key is invalid or not defined.");
}

/**
 * Tipo del payload de usuario para garantizar estructura fuerte.
 * 
 * Si quieres que sea genérico como antes, puedo regresarlo a Record<string, unknown>,
 * pero esta forma es la recomendada para un ERP (estricta y segura).
 */
interface JwtUserPayload extends JwtPayload {
    user_id: number;
    rol_id: number;
}

/**
 * Opciones estrictas de creación del token
 */
const signOptions: SignOptions = {
    expiresIn: "1h",
};

/**
 * Genera un token JWT de forma estrictamente tipada
 */
const generateToken = (payload: JwtUserPayload): string => {
    try {
        return jwt.sign(payload, secretKey, signOptions);
    } catch (error) {
        const err = error instanceof Error ? error.message : String(error);
        throw new Error(`Error generating token: ${err}`);
    }
};

/**
 * Verifica un JWT y retorna siempre un tipo seguro:
 *   → JwtPayload si es un token con payload JSON
 *   → string si es un token con payload en texto plano
 * 
 * En este ERP, garantizamos que siempre sea un JwtUserPayload.
 */
const verifyToken = (
    token: string,
    options?: VerifyOptions
): JwtUserPayload => {
    try {
        const decoded = jwt.verify(token, secretKey, options);
        // jsonwebtoken permite cadenas, pero aquí no deberían existir
        if (typeof decoded === "string") {
            throw new Error("Invalid JWT payload format.");
        }
        return decoded as JwtUserPayload;
    } catch (error) {
        const err = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid or expired token: ${err}`);
    }
};

/**
 * Decodifica un token sin verificarlo.
 * Retorna:
 *   → JwtPayload si es JSON
 *   → null si no se puede decodificar
 */
const decodeToken = (token: string): JwtUserPayload | null => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || typeof decoded !== "object") {
            return null;
        }
        return decoded as JwtUserPayload;
    } catch (error) {
        const err = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid token: ${err}`);
    }
};

export { decodeToken, verifyToken, generateToken };
export type { JwtPayload };