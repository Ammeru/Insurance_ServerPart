import { Sequelize } from '@sequelize/core';
import { initUserModel } from '../models/Users';
import {initRegCodeModel} from "../models/RegistrationCodes";
import {initCargoModel, Cargos} from "../models/Cargos";
import {initInsuranceModel, InsurancePolicies} from "../models/InsurancePolicies";
import {initInsuranceConnectModel, InsuranceConnect} from "../models/InsuranceConnect";
import {initPaymentsModel, Payments} from "../models/Payments";
import {initRiskModel, Risk} from "../models/Risk";

const initModels = (sequelize: Sequelize) => {
    initUserModel(sequelize);
    initRegCodeModel(sequelize);
    initInsuranceModel(sequelize);
    initCargoModel(sequelize);
    initRiskModel(sequelize);
    initPaymentsModel(sequelize);
    initInsuranceConnectModel(sequelize);

    InsurancePolicies.hasOne(InsuranceConnect, {foreignKey: 'insuranceId'});
    InsuranceConnect.belongsTo(InsurancePolicies, {foreignKey: 'insuranceId'});
    Cargos.hasOne(InsuranceConnect, {foreignKey: 'cargoId'});
    InsuranceConnect.belongsTo(Cargos, {foreignKey: 'cargoId'});
    Risk.hasOne(InsuranceConnect, {foreignKey: 'riskId'});
    InsuranceConnect.belongsTo(Risk, {foreignKey: 'riskId'});
    InsurancePolicies.hasOne(Payments, {foreignKey: 'insuranceId'});
    Payments.belongsTo(InsurancePolicies, {foreignKey: 'insuranceId'});
};

export { initModels };
