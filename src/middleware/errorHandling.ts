import ApiError from '../error/apiError';
import { Request, Response, NextFunction} from 'express';

const errorHandler = (err: unknown, req: Request,
                      res: Response, next: NextFunction): void => {
    if (err instanceof ApiError) {
        res.status(err.getStatus()).json({
            message: err.message
        });
    } else {
        res.status(500).json({
            message: "Непредвиденная ошибка"
        });
    }
}

export default errorHandler;