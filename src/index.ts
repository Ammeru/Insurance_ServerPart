require('dotenv').config();
import express from 'express';
import cors from 'cors';
import fileUpload from "express-fileupload";
import router from './routes';
import errorHandler from './middleware/errorHandling';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use('/api', router);


app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
