import { Model, DataTypes, Sequelize } from '@sequelize/core';

interface InsuranceAttributes {
    id: number;
    riskId: number;
    cargoId: number;
    insuranceId: number;
}

type InsuranceCreationAttributes = Omit<InsuranceAttributes, 'id'>;

class InsuranceConnect extends Model<InsuranceAttributes, InsuranceCreationAttributes> implements InsuranceAttributes {
    public id!: number;
    public riskId!: number;
    public cargoId!: number;
    public insuranceId!: number;
}

const initInsuranceConnectModel = (sequelize: Sequelize) => {
    InsuranceConnect.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        riskId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cargoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        insuranceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'InsuranceConnect',
        tableName: 'insuranceConnect',
        schema: 'insurance',
        timestamps: false,
    })
};

export { InsuranceConnect, initInsuranceConnectModel };