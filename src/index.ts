import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import router from './routes';
import errorHandler from './middleware/errorHandling';
import path from 'path';
import { connectDB } from './database/config/db'

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use('/api', router);


app.use(errorHandler);

import './cron/updateExpiredPolicies';

const start = async ():Promise<void> => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    } catch (error) {
        console.error("Ошибка запуска сервера", error);
        process.exit(1);
    }
}

start()
    .catch(error => {
        console.error("Ошибка запуска сервера", error);
    });
