import {UserRole, Users} from '../database/models/Users';
import ApiError from '../error/apiError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {NextFunction, Request, Response} from 'express';

const generateJwt = (id: number, email: string, firstName: string, role: UserRole) => {
    return jwt.sign(
         { id, email, firstName, role },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
    )
}

class UserController {

    async registration(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, firstName, lastName } = req.body;
            if (!email || !password) {
                return next(ApiError.badRequest("Неверная почта и/или пароль"));
            }
            const exist = await Users.findOne({ where: {email} });
            if (exist) {
                return next(ApiError.badRequest("Пользователь с такой почтой уже существует"));
            }

            const hashPassword = await bcrypt.hash(password, 10);
            const user = await Users.create({
               email,
               password: hashPassword,
               firstName,
               lastName,
               role: UserRole.USER
            });
            const token = generateJwt(user.id, user.email, user.firstName, user.role);
            return res.json({ token });
        } catch (error) {
            console.error("Ошибка выполнения:", error);
            return next(ApiError.iternal("Непредвиденная ошибка"));

        }
    }

}