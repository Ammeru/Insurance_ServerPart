import { Sequelize } from '@sequelize/core';
import { initUserModel } from '../models/Users';

const initModels = (sequelize: Sequelize) => {
    initUserModel(sequelize);
};

export { initModels };
