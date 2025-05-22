import { Request, Response, NextFunction } from 'express';
import ApiError from '../error/apiError';
import { JwtPayload } from './auth';

function checkRole(requiredRole: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as JwtPayload;

        if (user.role === 'admin') {
            next()
        }

        if (!user || user.role !== requiredRole) {
            return next(ApiError.forbidden("Недостаточно прав"));
        }

        next();
    };
}

export { checkRole };

//ПОЗЖЕ ПЕРЕНЕСТИ В utils