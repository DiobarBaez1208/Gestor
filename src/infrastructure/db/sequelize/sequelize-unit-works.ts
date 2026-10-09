import type { UnitOfWork } from "@core/db/unit-of-works.js";
import { sequelize } from "./sequelize-connetion";
import type { Transaction } from "sequelize";

export class SequelizeUnitOfWork implements UnitOfWork {
    async execute<T>(work: () => Promise<T>): Promise<T> {
        return sequelize.transaction(async (_transaction: Transaction): Promise<T> => work());
    }
}