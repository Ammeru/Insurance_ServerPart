import ApiError from '../error/apiError';
import {NextFunction, Request, Response} from 'express';
import { Cargos, CargoType } from '../database/models/Cargos';

class CargoController {
    async createCargo(req: Request, res: Response, next: NextFunction) {
        try {


        } catch (error) {
            console.error("Ошибка выполнения:", error);
            return next(ApiError.iternal("Ошибка создания груза"));
        }
    }

}

export default new CargoController();