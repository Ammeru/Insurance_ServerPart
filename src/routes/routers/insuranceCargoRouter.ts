import {Router} from 'express';
import insuranceController from "../../controllers/insuranceController";
import { auth } from '../../middleware/auth'
import {checkRole} from "../../middleware/checkRole";

const router: Router = Router();

// Клиентское
// _______________________________________________________________________________________
// Действия с грузом и анализом рисков
router.post('/cargo', auth, insuranceController.createCargo as any); // Создание груза
router.post('/cargo/risk', auth, insuranceController.createRiskAnalysis as any); // Создание анализа рисков
router.patch('/cargo/:id', auth, insuranceController.updateCargo as any); // Обновление по "Пересчитать"
router.patch('/cargo/risk/:id', auth, insuranceController.updateRisks as any); // Обновление по "Пересчитать"
// Действия с полисом
router.post('/insurance', auth, insuranceController.createInsurancePolicy as any); // Создание полиса
router.post('/insurance/payments', auth, insuranceController.createPayment as any); // Создание оплаты
// _______________________________________________________________________________________

// Просмотр полисов и оплата
router.get('/me', auth, insuranceController.getMyPolicies as any); // Получение своих полисов с возможностью фильтрации по статусам(или любой) (и само по себе отфильтровано от новейшего к старому)
router.get('/me/:id', auth, insuranceController.getMyPolicyById as any); // Подробнее о полисе
router.patch('/me/payments', auth, insuranceController.updatePayment); // Оплата полиса

// _______________________________________________________________________________________
// Для сотрудников
router.get('/', auth, checkRole('manager'), insuranceController.getAllPolicies as any); // Получение всех полисов с возможностью фильтрации по всем полям (и само по себе отфильтровано от новейшего к старому)
router.get('/:id', auth, checkRole('manager'), insuranceController.getPolicyById as any); // Подробнее о полисе
router.patch('/:id/cargo', auth, checkRole('manager'), insuranceController.updateCargoAndRecalculate as any); // По необходимости обновляет данные груза и анализа рисков
router.patch('/:id/status', auth, checkRole('manager'), insuranceController.updatePolicyStatus as any); // Обновляет статус полиса с "PENDING" на "CONFIRMED" или "DECLINED", по необходимости меняет стоимость в полисе и оплате

export default router;