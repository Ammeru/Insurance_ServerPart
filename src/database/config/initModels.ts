import { Sequelize } from '@sequelize/core';
import { initUserModel } from '../models/Users';
import {initRegCodeModel} from "../models/RegistrationCodes";
import {initCargoModel, Cargos} from "../models/Cargos";
import {initInsuranceModel, InsurancePolicies} from "../models/InsurancePolicies";
import {initInsurancePolicyCargoConnect, InsurancePolicyCargoConnect} from "../models/InsurancePolicyCargoConnect";
import {initPayments, Payments} from "../models/Payments";

const initModels = (sequelize: Sequelize) => {
    initUserModel(sequelize);
    initRegCodeModel(sequelize);
    initInsuranceModel(sequelize);
    initCargoModel(sequelize);
    initPayments(sequelize);
    initInsurancePolicyCargoConnect(sequelize);

    InsurancePolicies.hasOne(InsurancePolicyCargoConnect, {foreignKey: 'insuranceId'});
    InsurancePolicyCargoConnect.belongsTo(InsurancePolicies, {foreignKey: 'insuranceId'});
    Cargos.hasOne(InsurancePolicyCargoConnect, {foreignKey: 'cargoId'});
    InsurancePolicyCargoConnect.belongsTo(Cargos, {foreignKey: 'cargoId'});
    InsurancePolicies.hasOne(Payments, {foreignKey: 'insuranceId'});
    Payments.belongsTo(InsurancePolicies, {foreignKey: 'insuranceId'});
};

export { initModels };
