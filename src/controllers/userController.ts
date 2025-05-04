import {ClientType, UserRole, Users} from '../database/models/Users';
import ApiError from '../error/apiError';
import bcrypt from 'bcrypt';
import {NextFunction, Request, Response} from 'express';
import {generateJwt} from '../middleware/utils';
import {JwtPayload} from "../middleware/auth";
import {Op} from "@sequelize/core";

class UserController {

    async registration(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, phone, unp } = req.body;
            if (!email || !password) {
                return next(ApiError.badRequest("Неверная почта и/или пароль"));
            }

            const clientType = unp ? ClientType.LEGAL : ClientType.INDIVIDUAL;
            // Проверка есть ли в запросе inn, чтобы узнать кто регистрируется

            const exist = await Users.findOne({ where: {email} });
            if (exist) {
                return next(ApiError.badRequest("Пользователь с такой почтой уже существует"));
            }

            const hashPassword = await bcrypt.hash(password, 10);

            const user = await Users.create({
               email,
               password: hashPassword,
               phone,
               unp,
               clientType,
               role: UserRole.USER
            });
            const token = generateJwt(user.id, user.email, user.role);
            return res.json({ token });
        } catch (error) {
            console.error("Ошибка выполнения:", error);
            return next(ApiError.iternal("Непредвиденная ошибка"));

        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return next(ApiError.badRequest("Неверная почта и/или пароль"));
            }

            const exist = await Users.findOne({ where: {email} });
            if (!exist) {
                return next(ApiError.badRequest("Пользователя с такой почтой не существует"));
            }

            const comparePassword = await bcrypt.compare(password, exist.password);
            if (!comparePassword) {
                return next(ApiError.badRequest("Ошибка почты или пароля"));
            }
            const token = generateJwt(exist.id, exist.email, exist.role);
            return res.json({ token });

        } catch (error) {
            console.error("Ошибка выполнения:", error);
            return next(ApiError.iternal("Непредвиденная ошибка"));
        }
    }

    async check(req: Request, res: Response, next: NextFunction) {
        try {
            const user: JwtPayload = req.user;
            const token = generateJwt(user.id, user.email, user.role as UserRole);
            return res.json({ token });

        } catch (error) {
            console.error("Ошибка выполнения:", error);
            return next(ApiError.iternal("Непредвиденная ошибка"));
        }
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, phone, role, clientType } = req.query;

            const where: any = {}; // Параметры запросы
            if (email) where.email = { [Op.iLike]: `%${email}%` }; //Op.iLike для нечувствительности к регистру
            if (phone) where.phone = phone;
            if (role) where.role = role;
            if (clientType) where.clientType = clientType;

            const users = await Users.findAll({ where });
            return res.json(users);

        } catch (error) {
            console.error("Ошибка выполнения:", error);
            return next(ApiError.iternal("Ошибка получения пользователей"));
        }
    }

    async getOneUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const user = await Users.findByPk(id);
            if (!user) {
                return next(ApiError.notFound("Пользователь не найден"))
            }
            return res.json(user);

        } catch (error) {
            console.error("Ошибка выполнения:", error);
            return next(ApiError.iternal("Ошибка получения пользователя"));
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { email, phone, role } = req.body;

            const user = await Users.findByPk(id);
            if (!user) {
                return next(ApiError.notFound("Пользователь не найден"));
            }

            if (email) user.email = email;
            if (phone) user.phone = phone;
            if (role) user.role = role;

            await user.save();
            return res.json(user);
        } catch (error) {
            console.error("Ошибка выполнения:", error);
            return next(ApiError.iternal("Ошибка обновления пользователя"));
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const user = await Users.findByPk(id);
            if (!user) {
                return next(ApiError.notFound("Пользователь не найден"));
            }

            await user.destroy();
            return res.json({message: "Пользователь удалён"});
        } catch (error) {
            console.error("Ошибка выполнения:", error);
            return next(ApiError.iternal("Непредвиденная ошибка"));
        }
    }
}

export default new UserController();