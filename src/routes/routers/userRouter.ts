import {Router} from 'express';
import userController from '../../controllers/userController';
import { auth } from '../../middleware/auth'
import {checkRole} from "../../middleware/checkRole";

const router: Router = Router();

//Регистрация
router.post('/send-code', userController.sendCode as any);
router.post('/registration', userController.registration as any);
//Логин
router.post('/login', userController.login as any);
//Обновление токена
router.get('/auth', auth, userController.check as any);
// Для пользователя
router.get('/me', auth, userController.getMyProfile as any);
router.put('/me', auth, userController.updateMyProfile as any);
router.post('/me/send-email-code', auth, userController.sendUpdateCode as any);
router.put('/me/email', auth, userController.updateEmail as any);
router.put('/me/password', auth, userController.updatePassword as any);
//Для админа
router.get('/', auth, checkRole('admin'), userController.getAllUsers as any);
router.get('/:id', auth, checkRole('admin'), userController.getOneUser as any);
router.put('/:id', auth, checkRole('admin'), userController.updateUser as any);
router.delete('/:id', auth, checkRole('admin'), userController.deleteUser as any);

export default router;