import { Sequelize } from '@sequelize/core';
import { initUserModel } from '../models/Users';
import {initRegCodeModel} from "../models/RegistrationCodes";
import {initCargoModel, Cargos} from "../models/Cargos";
import {initInsuranceModel, InsurancePolicies} from "../models/InsurancePolicies";

const initModels = (sequelize: Sequelize) => {
    initUserModel(sequelize);
    initRegCodeModel(sequelize);
    initCargoModel(sequelize);
    initInsuranceModel(sequelize);

    InsurancePolicies.hasMany(Cargos, {foreignKey: 'insurance_id'});
    Cargos.belongsTo(InsurancePolicies, {foreignKey: 'insurance_id'});
};

export { initModels };
