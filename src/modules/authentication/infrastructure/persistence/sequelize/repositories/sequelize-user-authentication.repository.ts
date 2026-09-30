import { UserAuthentication, UserAuthenticationRepository } from "@src/modules/authentication/application/contracts/repositories/user-authentication.repository";

export class SequelizeUserAuthenticationRepository implements UserAuthenticationRepository {

    async findByEmail( email: string ): Promise<UserAuthentication | null> {

        const user = await UserModel.findOne({
            where: { email },
        });

        if (!user) return null;

        return {
            userId: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            roleId: user.roleId,
        };
    }
}