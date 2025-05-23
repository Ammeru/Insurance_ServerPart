import {NextFunction, Request, Response} from 'express';
import {InsurancePolicies, InsuranceStatus, InsuranceType} from '../database/models/InsurancePolicies';
import {Cargos} from '../database/models/Cargos';
import {Risk} from '../database/models/Risk';
import {Payments, PaymentStatus} from "../database/models/Payments";
import ApiError from "../error/apiError";
import {JwtPayload} from "../middleware/auth";
import {calculateInsuranceCost, calculateRiskLevel, getCoordinates, getRouteDistance} from "../middleware/utils";
import {InsuranceConnect} from "../database/models/InsuranceConnect";



class InsuranceController {

    async createCargo(req: Request, res: Response, next: NextFunction) {
        try {
            const { cargoName, cargoType, cargoValue, cargoWeight, fromCity, toCity, deliveryDate } = req.body;
            if ( !cargoName || !cargoType || !cargoValue || !cargoWeight || !fromCity || !toCity || !deliveryDate ) {
                return next(ApiError.badRequest("Все данные должны быть заполнены"));
            }

            const cargo = await Cargos.create({
                cargoName, cargoType, cargoValue, cargoWeight, fromCity, toCity, deliveryDate
            });

            res.json(cargo);
        } catch(error) {
            console.error("Ошибка при создании груза:", error);
            return next(ApiError.badRequest("Ошибка при создании груза"));
        }
    }

    async createRiskAnalysis(req: Request, res: Response, next: NextFunction) {
        try {
            const { cargoId, insuranceTariff, insuranceType } = req.body;

            const cargo = await Cargos.findByPk(cargoId);
            if (!cargo) {
                return next(ApiError.notFound("Груз не найден"));
            }

            const fromCoordinates = await getCoordinates(cargo.fromCity);
            const toCoordinates = await getCoordinates(cargo.toCity);
            if (!fromCoordinates || !toCoordinates) {
                return next(ApiError.badRequest("Не удалось получить координаты городов"));
            }

            const distance = await getRouteDistance(fromCoordinates, toCoordinates);
            if (!distance) {
                return next(ApiError.badRequest("Не удалось рассчитать маршрут"));
            }

            const { riskLevel, riskReason, riskScore } = calculateRiskLevel(cargo.cargoWeight, cargo.cargoValue, cargo.cargoType, distance);
            const risk = await Risk.create({ riskLevel, riskReason, riskScore});

            const baseAmount = calculateInsuranceCost(cargo.cargoValue, riskScore, insuranceTariff);
            const multiplier = insuranceType === "multiple" ? 4 : 1;
            const amount = baseAmount * multiplier;

            res.json({ risk, amount });
        } catch(error) {
            console.error("Ошибка анализа риска:", error);
            return next(ApiError.internal("Не удалось провести анализ риска"));
        }
    }

    async updateCargo(req: Request, res: Response, next: NextFunction) {
        try {
            const cargoId = req.params.id;
            const { cargoName, cargoType, cargoValue, cargoWeight, fromCity, toCity, deliveryDate } = req.body;

            if (!cargoId || !cargoName || !cargoType || !cargoValue || !cargoWeight || !fromCity || !toCity || !deliveryDate) {
                return next(ApiError.badRequest("Все данные должны быть заполнены"));
            }

            const cargo = await Cargos.findByPk(cargoId);
            if (!cargo) {
                return next(ApiError.notFound("Груз не найден"));
            }

            await cargo.update({ cargoName, cargoType, cargoValue, cargoWeight, fromCity, toCity, deliveryDate });

            res.json(cargo);
        } catch (error) {
            console.error("Ошибка при обновлении груза:", error);
            return next(ApiError.internal("Ошибка при обновлении груза"));
        }
    }

    async updateRisks(req: Request, res: Response, next: NextFunction) {
        try {
            const riskId = req.params.id;
            const { cargoId, insuranceTariff, insuranceType } = req.body;

            const cargo = await Cargos.findByPk(cargoId);
            if (!cargo) {
                return next(ApiError.notFound("Груз не найден"));
            }

            const fromCoordinates = await getCoordinates(cargo.fromCity);
            const toCoordinates = await getCoordinates(cargo.toCity);
            if (!fromCoordinates || !toCoordinates) {
                return next(ApiError.badRequest("Не удалось получить координаты городов"));
            }

            const distance = await getRouteDistance(fromCoordinates, toCoordinates);
            if (!distance) {
                return next(ApiError.badRequest("Не удалось рассчитать маршрут"));
            }

            const { riskLevel, riskReason, riskScore } = calculateRiskLevel(cargo.cargoWeight, cargo.cargoValue, cargo.cargoType, distance);

            const risk = await Risk.findByPk(riskId);
            if (!risk) {
                return next(ApiError.notFound("Риск не найден"));
            }
            await risk.update({ riskLevel, riskReason, riskScore});

            const baseAmount = calculateInsuranceCost(cargo.cargoValue, riskScore, insuranceTariff);
            const multiplier = insuranceType === "multiple" ? 4 : 1;
            const amount = baseAmount * multiplier;

            res.json({ risk, amount });
        } catch(error) {
            console.error("Ошибка при обновлении анализа риска:", error);
            return next(ApiError.internal("Не удалось обновить анализ риска"));
        }
    }

    async createInsurancePolicy(req: Request, res: Response, next: NextFunction) {
        try {
            const { cargoId, amount, insuranceType, insuranceTariff } = req.body;

            const cargo = await Cargos.findByPk(cargoId);
            if (!cargo) {
                return next(ApiError.notFound("Груз не найден"));
            }

            const startDate = new Date();

            const policy = await InsurancePolicies.create({
                userId: (req.user as JwtPayload).id,
                insuranceType: insuranceType,
                insuranceTariff: insuranceTariff,
                startDate: startDate,
                endDate: cargo.deliveryDate,
                insuranceStatus: InsuranceStatus.PENDING,
                amount: amount
            });

            res.json(policy);
        } catch(error) {
            console.error("Ошибка при создании страхового полиса:", error);
            return next(ApiError.internal("Не удалось создать страховой полис"));
        }
    }

    async createPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const { insuranceId, cargoId, riskId, amount } = req.body;
            const policy = await InsurancePolicies.findByPk(insuranceId);
            if (!policy) {
                return next(ApiError.notFound("Страховой полис не найден"));
            }

            const payment = await Payments.create({
               insuranceId: policy.id,
               amount: amount,
               paymentStatus: PaymentStatus.PENDING,
               paidAt: null
            });

            const connect = await InsuranceConnect.create({
                insuranceId: insuranceId,
                cargoId: cargoId,
                riskId: riskId
            })

            res.json({ payment, connect });
        } catch(error) {
            console.error("Ошибка при создрании оплаты:", error);
            return next(ApiError.internal("Не удалось создать оплату"));
        }
    }

    async createResponsibilityPolicy(req: Request, res: Response, next: NextFunction) {
        try {
            const { insuranceTariff, durationType, amount } = req.body;

            const startDate = new Date();
            let endDate: Date;

            if (durationType === 'single') {
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 7); // 7 дней
            } else if (durationType === 'annual') {
                endDate = new Date(startDate);
                endDate.setFullYear(startDate.getFullYear() + 1);
            } else {
                return next(ApiError.badRequest("Неверно указан срок страхования"));
            }

            const policy = await InsurancePolicies.create({
                userId: (req.user as JwtPayload).id,
                insuranceType: InsuranceType.RESPONSIBILITY,
                insuranceTariff: insuranceTariff,
                startDate,
                endDate,
                insuranceStatus: InsuranceStatus.CONFIRMED,
                amount
            });

            const payment = await Payments.create({
                insuranceId: policy.id,
                amount,
                paymentStatus: PaymentStatus.PENDING,
                paidAt: null
            });

            res.json({ policy, payment });
        } catch(error) {
            console.error("Ошибка при создании полиса ответственности:", error);
            return next(ApiError.internal("Не удалось создать страховой полис ответственности"));
        }
    }

    async getMyPolicies(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as JwtPayload).id;
            const { status } = req.query;

            const whereClause: any = {
                userId
            };

            if (status && typeof status === "string") {
                whereClause.insuranceStatus = status;
            }

            const policies = await InsurancePolicies.findAll({
                where: whereClause,
                order: [['endDate', 'ASC']]
            });

            res.json(policies);

        } catch(error) {
            console.error("Ошибка при получении полисов пользователя:", error);
            return next(ApiError.internal("Не удалось получить полисы"));
        }
    }

    async getMyPolicyById(req: Request, res: Response, next: NextFunction) {
        try {
            const insuranceId = req.params.id;
            const userId = (req.user as JwtPayload).id;

            const policy = await InsurancePolicies.findOne({
                where: {
                    id: insuranceId,
                    userId: userId
                }
            });

            if (!policy) {
                return next(ApiError.notFound("Полис не найден"));
            }

            const connect = await InsuranceConnect.findOne({
                where: {
                    insuranceId: insuranceId
                }
            });

            if (!connect) {
                return next(ApiError.notFound("Соединение не найдено"));
            }

            const cargo = await Cargos.findOne({
                where: {
                    id: connect?.cargoId
                }
            });

            if (!cargo) {
                return next(ApiError.notFound("Груз не найден"));
            }

            const risk = await Risk.findOne({
                where: {
                    id: connect?.riskId
                }
            })

            if (!risk) {
                return next(ApiError.notFound("Риск не найден"));
            }

            res.json({ policy, cargo, risk });
        } catch(error) {
            console.error("Ошибка при получении полиса:", error);
            return next(ApiError.internal("Не удалось получить полис"));
        }
    }

    async updatePayment(req: Request, res: Response, next: NextFunction) {
        try {
            const { insuranceId } = req.body;
            const userId = (req.user as JwtPayload).id;

            const policy = await InsurancePolicies.findOne({
                where: { id: insuranceId, userId: userId }
            });

            if (!policy) {
                return next(ApiError.notFound("Полис не найден"));
            }

            const payment = await Payments.findOne({
                where: {
                    insuranceId: policy.id,
                    paymentStatus: PaymentStatus.PENDING
                }
            });

            if (!payment) {
                return next(ApiError.badRequest("Оплата уже произведена или не найдена"));
            }

            await payment.update({
                paymentStatus: PaymentStatus.PAID,
                paidAt: new Date()
            });

            await policy.update({
                insuranceStatus: InsuranceStatus.PAID
            });

            await policy.update({
                insuranceStatus: InsuranceStatus.ACTIVE
            });

            res.json({ payment, policy });
        } catch(error) {
            console.error("Ошибка при обновлении оплаты:", error);
            return next(ApiError.internal("Не удалось провести оплату"));
        }
    }

    async getAllPolicies(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, insuranceType, insuranceTariff, insuranceStatus } = req.query;
            const whereClause: any = {};

            if (id) whereClause.id = id;
            if (insuranceType) whereClause.insuranceType = insuranceType;
            if (insuranceTariff) whereClause.insuranceTariff = insuranceTariff;
            if (insuranceStatus) whereClause.insuranceStatus = insuranceStatus;

            const policies = await InsurancePolicies.findAll({
                where: whereClause,
                order: [['id', 'DESC']]
            });

            res.json(policies);
        } catch(error) {
            console.error("Ошибка при получении всех полисов:", error);
            return next(ApiError.internal("Не удалось получить полисы"));
        }
    }

    async getPolicyById(req: Request, res: Response, next: NextFunction) {
        try {
            const insuranceId = req.params.id;

            const policy = await InsurancePolicies.findOne({ where: { id: insuranceId } });
            if (!policy) return next(ApiError.notFound("Полис не найден"));

            const connect = await InsuranceConnect.findOne({ where: { insuranceId } });
            if (!connect) return next(ApiError.notFound("Связь не найдена"));

            const cargo = await Cargos.findOne({ where: { id: connect.cargoId } });
            const risk = await Risk.findOne({ where: { id: connect.riskId } });

            res.json({ policy, cargo, risk });
        } catch(error) {
            console.error("Ошибка при получении полиса:", error);
            return next(ApiError.internal("Не удалось получить полис"));
        }
    }

    async updateCargoAndRecalculate(req: Request, res: Response, next: NextFunction) {
        try {
            const insuranceId = req.params.id;
            const { cargoName, cargoType, cargoValue, cargoWeight, fromCity, toCity, deliveryDate } = req.body;

            if (!cargoName || !cargoType || !cargoValue || !cargoWeight || !fromCity || !toCity || !deliveryDate) {
                return next(ApiError.badRequest("Все данные должны быть заполнены"));
            }

            const connect = await InsuranceConnect.findOne({
                where: { insuranceId: insuranceId}
            });
            if (!connect) {
                return next(ApiError.notFound("Соединения не найдено"));
            }

            const cargo = await Cargos.findByPk(connect.cargoId);
            if (!cargo) {
                return next(ApiError.notFound("Груз не найден"));
            }

            await cargo.update({ cargoName, cargoType, cargoValue, cargoWeight, fromCity, toCity, deliveryDate });

            const fromCoordinates = await getCoordinates(cargo.fromCity);
            const toCoordinates = await getCoordinates(cargo.toCity);
            if (!fromCoordinates || !toCoordinates) {
                return next(ApiError.badRequest("Не удалось получить координаты городов"));
            }

            const distance = await getRouteDistance(fromCoordinates, toCoordinates);
            if (!distance) {
                return next(ApiError.badRequest("Не удалось рассчитать маршрут"));
            }

            const { riskLevel, riskReason, riskScore } = calculateRiskLevel(cargo.cargoWeight, cargo.cargoValue, cargo.cargoType, distance);

            const risk = await Risk.findByPk(connect.riskId);
            if (!risk) {
                return next(ApiError.notFound("Риск не найден"));
            }
            await risk.update({ riskLevel, riskReason, riskScore});

            const policy = await InsurancePolicies.findOne({
                where: { id: insuranceId}
            });
            if (!policy) {
                return next(ApiError.notFound("Полис не найден"));
            }

            const baseAmount = calculateInsuranceCost(cargo.cargoValue, riskScore, policy.insuranceTariff);
            const multiplier = policy.insuranceType === "multiple" ? 4 : 1;
            const amount = baseAmount * multiplier;

            await policy.update({ amount });

            const payment = await Payments.findOne({
               where: { insuranceId: insuranceId}
            });
            if (!payment) {
                return next(ApiError.notFound("Оплата не найдена"));
            }

            await payment.update({ amount });

            res.json({ cargo, risk, policy, payment });
        } catch(error) {

        }
    }

    async updatePolicyStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const insuranceId = req.params.id;
            const { status } = req.body;

            const policy = await InsurancePolicies.findByPk(insuranceId);
            if (!policy) return next(ApiError.notFound("Полис не найден"));

            await policy.update({ insuranceStatus: status });

            res.json({ message: "Статус обновлён", policy });
        } catch(error) {
            console.error("Ошибка при обновлении статуса:", error);
            return next(ApiError.internal("Не удалось обновить статус"));
        }
    }

}

export default new InsuranceController();