export interface UserAuthentication {
    userId: number;
    email: string;
    passwordHash: string;
    roleId: number;
}

export interface UserAuthenticationRepository {
    findByEmail(
        email: string,
    ): Promise<UserAuthentication | null>;
}