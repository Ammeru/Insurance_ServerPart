import {Router} from 'express';
import userController from '../../controllers/userController';
//import { auth } from '../../middleware/auth'

const router: Router = Router();

router.post('/registration', userController.registration as any);
//router.post('/login', );

//router.get('/auth', auth, );
//router.get('/', auth, );
//router.get('/:id', auth, );
//router.get('/:id', auth, );
//router.get('/:id', auth, );

export default router;