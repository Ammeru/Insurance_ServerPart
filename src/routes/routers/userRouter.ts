import {Router} from 'express';
import userController from '../../controllers/userController';
import { auth } from '../../middleware/auth'
import {checkRole} from "../../middleware/checkRole";

const router: Router = Router();

//Регистрация
router.post('/send-code', userController.sendCode as any); // Отправка кода для регистрации
router.post('/registration', userController.registration as any); // Регистрация
//Логин
router.post('/login', userController.login as any); // Логин
//Обновление токена
router.get('/auth', auth, userController.check as any); // Обновление токена
// Для пользователя
router.get('/me', auth, userController.getMyProfile as any); // Открыть свой профиль
router.patch('/me', auth, userController.updateMyProfile as any); // Обновить свой профиль
router.post('/me/send-email-code', auth, userController.sendUpdateCode as any); // Отправить код на обновление email
router.patch('/me/email', auth, userController.updateEmail as any); // Обновить email
router.patch('/me/password', auth, userController.updatePassword as any); // Обновить пароль
//Для админа
router.get('/', auth, checkRole('admin'), userController.getAllUsers as any); // Получение списка пользователей
router.get('/:id', auth, checkRole('admin'), userController.getOneUser as any); // Подробнее о пользователях
router.patch('/:id', auth, checkRole('admin'), userController.updateUser as any); // Обновление пользователя
router.delete('/:id', auth, checkRole('admin'), userController.deleteUser as any); // Удаление пользователя

export default router;