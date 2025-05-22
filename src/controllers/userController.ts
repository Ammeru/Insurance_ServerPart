import {ClientType, UserRole, Users} from '../database/models/Users';
import { RegCodes} from "../database/models/RegistrationCodes";
import ApiError from '../error/apiError';
import bcrypt from 'bcrypt';
import crypto from "crypto";
import {NextFunction, Request, Response} from 'express';
import {generateJwt} from '../middleware/utils';
import {sendMail} from "../middleware/mailer";
import {JwtPayload} from "../middleware/auth";
import {Op} from "@sequelize/core";

class UserController {

    async sendCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) {
                return next(ApiError.badRequest("Не указана почта"));
            }

            const code = crypto.randomInt(100000, 999999).toString(); //Генерирует код из 6 символов
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); //Код будет существовать примерно 10 минут


            await RegCodes.upsert({email, code, expiresAt}); //Создание или обновление кода

            await sendMail(email, "Код для подтверждения регистрации", `Ваш код ${code}`); //Отправляем код

            return res.json({message: "Код отправлен на почту!"});
        } catch (error) {
            console.error("Ошибка отправки кода:", error);
            return next(ApiError.iternal("Ошибка отправки кода"));
        }
    }

    async registration(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, code } = req.body;
            if (!email || !password || !code) {
                return next(ApiError.badRequest("Отсутствует почта и/или пароль/код"));
            }

            const exist = await Users.findOne({ where: {email} });
            if (exist) {
                return next(ApiError.badRequest("Пользователь с такой почтой уже существует"));
            }

            const regCode = await RegCodes.findOne({where: {email, code}});
            if (!regCode) {
                return next(ApiError.badRequest("Неверный код подтверждения"));
            }

            if (new Date(regCode.expiresAt) < new Date()) {
                await regCode.destroy();
                return next(ApiError.badRequest("Код подтверждения истёк"));
            }

            const hashPassword = await bcrypt.hash(password, 10);

            const user = await Users.create({
               email,
               password: hashPassword,
               clientType: ClientType.PHYSICAL,
               role: UserRole.USER
            });
            const token = generateJwt(user.id, user.email, user.role, user.clientType);
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
            const token = generateJwt(exist.id, exist.email, exist.role, exist.clientType);
            return res.json({ token });

        } catch (error) {
            console.error("Ошибка выполнения:", error);
            return next(ApiError.iternal("Непредвиденная ошибка"));
        }
    }

    async check(req: Request, res: Response, next: NextFunction) {
        try {
            const user: JwtPayload = req.user;
            const token = generateJwt(user.id, user.email, user.role as UserRole, user.clientType as ClientType);
            return res.json({ token });

        } catch (error) {
            console.error("Ошибка выполнения:", error);
            return next(ApiError.iternal("Непредвиденная ошибка"));
        }
    }

    async getMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as JwtPayload).id;
            const user = await Users.findByPk(userId);

            if (!user) {
                return next(ApiError.notFound("Пользователь не найден"));
            }
            return res.json(user);
        } catch (error) {
            console.error("Ошибка получения профиля:", error);
            return next(ApiError.iternal("Ошибка получения профиля"));
        }
    }

    async updateMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as JwtPayload).id;
            const { phone, unp } = req.body;

            const user = await Users.findByPk(userId);
            if (!user) {
                return next(ApiError.notFound("Пользователь не найден"));
            }

            if (phone) {
                if (phone && !/^\+?\d{7,15}$/.test(phone)) {
                    return next(ApiError.badRequest("Некорректный номер телефона"));
                }
                await user.update({phone: phone});
            }

            if (unp) {
                if (!/^\d{9}$/.test(unp)) {
                    return next(ApiError.badRequest("UNP должен состоять из 9 цифр"));
                }
                if (user.clientType === ClientType.LEGAL) {
                    return next(ApiError.badRequest("UNP уже задан для юридического лица"));
                }
                await user.update({unp: unp, clientType: ClientType.LEGAL});
            }

            return res.json({ message: "Профиль успешно обновлён", user });
        } catch (error) {
            console.error("Ошибка обновления профиля:", error);
            return next(ApiError.iternal("Ошибка обновления профиля"));
        }
    }

    async sendUpdateCode(req: Request, res: Response, next: NextFunction) {
        try {
            const email = (req.user as JwtPayload).email;

            const code = crypto.randomInt(100000, 999999).toString(); //Генерирует код из 6 символов
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); //Код будет существовать примерно 10 минут

            await RegCodes.upsert({email, code, expiresAt}); //Создание или обновление кода

            await sendMail(email, "Код для обновления данных", `Ваш код ${code}`); //Отправляем код

            return res.json({message: "Код отправлен на почту!"});
        } catch (error) {
            console.error("Ошибка отправки кода:", error);
            return next(ApiError.iternal("Ошибка отправки кода"));
        }
    }

    async updateEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as JwtPayload).id;
            const oldEmail = (req.user as JwtPayload).email;
            const { newEmail, code } = req.body;

            if (!newEmail || !code) {
                return next(ApiError.badRequest("Нужны новый email и код"));
            }
            const regCode = await RegCodes.findOne({where: {email: oldEmail, code}});
            if (!regCode) {
                return next(ApiError.badRequest("Неверный код подтверждения"));
            }
            if (new Date(regCode.expiresAt) < new Date()) {
                await regCode.destroy();
                return next(ApiError.badRequest("Код подтверждения истёк"));
            }
            const exist = await Users.findOne({ where: {email: newEmail} });
            if (exist) {
                return next(ApiError.badRequest("Этот email уже занят"));
            }

            const user = await Users.findByPk(userId);
            if (!user) return next(ApiError.badRequest("Пользователь не найден"));

            await user.update({ email: newEmail });
            const token = generateJwt(user.id, user.email, user.role as UserRole, user.clientType as ClientType);
            return res.json({ token });
        } catch (error) {
            console.error("Ошибка обновления email:", error);
            return next(ApiError.iternal("Ошибка обновления email"));
        }
    }

    async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as JwtPayload).id;
            const { oldPassword, newPassword, confirmPassword } = req.body;

            if (!oldPassword || !newPassword || !confirmPassword) {
                return next(ApiError.badRequest("Все поля обязательны"));
            }
            if (newPassword !== confirmPassword) {
                return next(ApiError.badRequest("Пароли не совпадают"));
            }

            const user = await Users.findByPk(userId);
            if (!user) return next(ApiError.badRequest("Пользователь не найден"));

            const isValid = await bcrypt.compare(oldPassword, user.password);
            if (!isValid) return next(ApiError.badRequest("Неверный текущий пароль"));

            const hash = await bcrypt.hash(newPassword, 10);
            await user.update({ password: hash });

            return res.json({ message: "Пароль обновлён" });
        } catch (error) {
            console.error("Ошибка обновления пароля:", error);
            return next(ApiError.iternal("Ошибка смены пароля"));
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

            if (email && email !== user.email) {
                user.email = email;
            }
            if (phone && phone !== user.phone) {
                if (!/^\+?\d{7,15}$/.test(phone)) {
                    return next(ApiError.badRequest("Некорректный номер телефона"));
                }
                user.phone = phone;
            }
            if (role) {
                user.role = role;
            }

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