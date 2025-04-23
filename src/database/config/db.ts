import { Sequelize } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import { initModels} from "./initModels";

const sequelize = new Sequelize({
    dialect: PostgresDialect,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    ssl: false,
    connectionTimeoutMillis: 10000
});

console.log('Создан экземпляр Sequelize');

initModels(sequelize);

const connectDB = async ():Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log('Подключено к БД');
        await sequelize.sync({alter: true});
        console.log("Модели инициализированы");
    } catch (error) {
        console.error("Ошибка подключения к БД:", error);
        throw error;
    }
}

export { sequelize, connectDB};