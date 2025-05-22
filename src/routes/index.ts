import { Router } from 'express';
import userRouter from './routers/userRouter';
import insuranceCargoRouter from "./routers/insuranceCargoRouter";

const router = Router();

router.use('/user', userRouter);
router.use('/policies', insuranceCargoRouter);

export default router;