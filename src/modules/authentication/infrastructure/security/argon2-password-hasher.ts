import type { PasswordHasher } from "../../application/contracts/services/password-hasher";
import argon2 from "argon2";

export class Argon2PasswordHasher
    implements PasswordHasher {

    async hash(password: string): Promise<string> {
        return argon2.hash(password);
    }

    async verify(password: string, hash: string): Promise<boolean> {
        return argon2.verify(
            hash,
            password,
        );
    }
}