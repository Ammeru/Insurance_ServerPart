import jwt from 'jsonwebtoken';
import ApiError from "../error/apiError";
import { Request, Response, NextFunction } from "express";

interface JwtPayload {
    id: number;
    email: string;
    role: string;
    clientType: string;
    issuedAt?: number;
    expiresAt?: number;
} // Данные токена

function auth(req: Request, res: Response, next: NextFunction) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next(ApiError.unauthorized("Пользователь не авторизирован"));
    }

    const token = authHeader.split(" ")[1]; // заголовок Bearer и токен
    if (!token) {
        return next(ApiError.unauthorized("Токена не существует"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return next(ApiError.unauthorized("Токен недействителен"))
    }
}

export { auth, JwtPayload };

//ПОЗЖЕ ПЕРЕНЕСТИ В utils