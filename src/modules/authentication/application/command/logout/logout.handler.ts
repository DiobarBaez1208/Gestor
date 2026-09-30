import type { SessionRepository } from "../../contracts/repositories/session.repository";
import { SessionNotFoundError } from "../../../domain/errors/session-not-found.error";
import type { LogoutCommand } from "./logout.command";

export class LogoutHandler {

    constructor(private readonly sessionRepository: SessionRepository) { }

    async execute(command: LogoutCommand): Promise<void> {

        const session = await this.sessionRepository.findById(command.sessionId);

        if (!session) throw new SessionNotFoundError();

        session.revoke();

        await this.sessionRepository.save(session);
    }
}