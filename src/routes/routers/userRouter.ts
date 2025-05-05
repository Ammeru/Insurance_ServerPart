import {Router} from 'express';
import userController from '../../controllers/userController';
import { auth } from '../../middleware/auth'
import {checkRole} from "../../middleware/checkRole";

const router: Router = Router();

//Для регистрации
router.post('/send-code', userController.sendCode as any);
router.post('/registration', userController.registration as any);
//Для логина
router.post('/login', userController.login as any);
//Обновление токена
router.get('/auth', auth, userController.check as any);
//Прочее
router.get('/', auth, checkRole('admin'), userController.getAllUsers as any);
router.get('/:id', auth, checkRole('admin'), userController.getOneUser as any);

router.get('/me', auth, userController.getMyProfile as any);
router.put('/:id', auth, userController.updateUser as any);
router.delete('/:id', auth, userController.deleteUser as any);

export default router;