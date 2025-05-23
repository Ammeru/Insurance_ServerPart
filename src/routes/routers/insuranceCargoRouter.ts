import {Router} from 'express';
import insuranceController from "../../controllers/insuranceController";
import { auth } from '../../middleware/auth'
import {checkRole} from "../../middleware/checkRole";

const router: Router = Router();

// Клиентское
// _______________________________________________________________________________________
// Действия с грузом и анализом рисков
router.post('/cargo', auth, insuranceController.createCargo); // Создание груза
router.post('/cargo/risk', auth, insuranceController.createRiskAnalysis); // Создание анализа рисков
router.patch('/cargo/:id', auth, insuranceController.updateCargo); // Обновление по "Пересчитать"
router.patch('/cargo/risk/:id', auth, insuranceController.updateRisks); // Обновление по "Пересчитать"
// Действия с полисом
router.post('/insurance', auth, insuranceController.createInsurancePolicy); // Создание полиса
router.post('/insurance/payments', auth, insuranceController.createPayment); // Создание оплаты
router.post('/insurance/responsibility', auth, insuranceController.createResponsibilityPolicy); // Ответственность
// _______________________________________________________________________________________

// Просмотр полисов и оплата
router.get('/me', auth, insuranceController.getMyPolicies); // Получение своих полисов с возможностью фильтрации по статусам(или любой) (и само по себе отфильтровано от новейшего к старому)
router.get('/me/:id', auth, insuranceController.getMyPolicyById); // Подробнее о полисе
router.patch('/me/payments', auth, insuranceController.updatePayment); // Оплата полиса

// _______________________________________________________________________________________
// Для сотрудников
router.get('/', auth, checkRole('manager'), insuranceController.getAllPolicies); // Получение всех полисов с возможностью фильтрации по всем полям (и само по себе отфильтровано от новейшего к старому)
router.get('/:id', auth, checkRole('manager'), insuranceController.getPolicyById); // Подробнее о полисе
router.patch('/:id/cargo', auth, checkRole('manager'), insuranceController.updateCargoAndRecalculate); // По необходимости обновляет данные груза и анализа рисков
router.patch('/:id/status', auth, checkRole('manager'), insuranceController.updatePolicyStatus); // Обновляет статус полиса с "PENDING" на "CONFIRMED" или "DECLINED", по необходимости меняет стоимость в полисе и оплате

export default router;