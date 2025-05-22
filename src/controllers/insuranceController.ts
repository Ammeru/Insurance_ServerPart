import {NextFunction, Request, Response} from 'express';
import {InsurancePolicies, InsuranceType, InsuranceTariff, InsuranceStatus} from '../database/models/InsurancePolicies';
import {Cargos, CargoType} from '../database/models/Cargos';
import {Risk, RiskLevel} from '../database/models/Risk';
import {Payments, PaymentStatus} from '../database/models/Payments';
import {InsuranceConnect} from '../database/models/InsuranceConnect';
import ApiError from "../error/apiError";
import {JwtPayload} from "../middleware/auth";
import {Op} from "@sequelize/core"


class InsuranceController {

    async createCargo(req: Request, res: Response, next: NextFunction) {
        try {
            const { cargoName, cargoType, cargoValue, cargoWeight, fromCity, ToCity, deliveryDate } = req.body;

        } catch(error) {

        }
    }

    async createRiskAnalysis(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {

        }
    }

    async updateCargo(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {

        }
    }

    async updateRisks(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {

        }
    }

    async createInsurancePolicy(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {

        }
    }
    async createPayment(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {

        }
    }

    async getMyPolicies(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {

        }
    }

    async getMyPolicyById(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {

        }
    }

    async updatePayment(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {

        }
    }

    async getAllPolicies(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {

        }
    }

    async getPolicyById(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {

        }
    }

    async updateCargoAndRecalculate(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {

        }
    }

    async updatePolicyStatus(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(error) {

        }
    }

}

export default new InsuranceController();