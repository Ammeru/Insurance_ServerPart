import {Router} from 'express';
import userController from '../../controllers/userController';
import { auth } from '../../middleware/auth'
import {checkRole} from "../../middleware/checkRole";

const router: Router = Router();

//Регистрация
router.post('/send-code', userController.sendCode); // Отправка кода для регистрации
router.post('/registration', userController.registration); // Регистрация
//Логин
router.post('/login', userController.login); // Логин
//Обновление токена
router.get('/auth', auth, userController.check); // Обновление токена
// Для пользователя
router.get('/me', auth, userController.getMyProfile); // Открыть свой профиль
router.patch('/me', auth, userController.updateMyProfile); // Обновить свой профиль
router.post('/me/send-email-code', auth, userController.sendUpdateCode); // Отправить код на обновление email
router.patch('/me/email', auth, userController.updateEmail); // Обновить email
router.patch('/me/password', auth, userController.updatePassword); // Обновить пароль
//Для админа
router.get('/', auth, checkRole('admin'), userController.getAllUsers); // Получение списка пользователей
router.get('/:id', auth, checkRole('admin'), userController.getOneUser); // Подробнее о пользователях
router.patch('/:id', auth, checkRole('admin'), userController.updateUser); // Обновление пользователя
router.delete('/:id', auth, checkRole('admin'), userController.deleteUser); // Удаление пользователя

export default router;