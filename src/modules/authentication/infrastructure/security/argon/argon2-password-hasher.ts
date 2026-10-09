import type { PasswordHasher } from "../../../application/contracts/services/password-hasher.js";
import { argon2Config } from "./argon2-config";
import argon2 from "argon2";

export class Argon2PasswordHasher implements PasswordHasher {

    async hash( password: string ): Promise<string> {
        return argon2.hash( password, argon2Config );
    }

    async verify( password: string, hash: string ): Promise<boolean> {
        return argon2.verify( hash, password, );
    }
}