import { Sequelize } from '@sequelize/core';
import { initUserModel } from '../models/Users';
import {initRegCodeModel} from "../models/RegistrationCodes";

const initModels = (sequelize: Sequelize) => {
    initUserModel(sequelize);
    initRegCodeModel(sequelize);
};

export { initModels };
