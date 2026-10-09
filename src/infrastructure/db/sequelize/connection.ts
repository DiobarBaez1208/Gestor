import { sequelize } from "@infrastructure/db/sequelize/sequelize-connetion";

export async function connectDatabase(): Promise<void> {
    await sequelize.authenticate();
    console.log("Database connection established.");
}

export async function disconnectDatabase(): Promise<void> {
    await sequelize.close();
    console.log( "Database connection closed.");
}