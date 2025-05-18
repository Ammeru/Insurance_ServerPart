import { Model, DataTypes, Sequelize } from '@sequelize/core';

interface InsuranceCargoAttributes {
    id: number;
    cargoId: number;
    insuranceId: number;
}

type InsuranceCargoCreationAttributes = Omit<InsuranceCargoAttributes, 'id'>;

class InsurancePolicyCargoConnect extends Model<InsuranceCargoAttributes, InsuranceCargoCreationAttributes> implements InsuranceCargoAttributes {
    public id!: number;
    public cargoId!: number;
    public insuranceId!: number;
}

const initInsurancePolicyCargoConnect = (sequelize: Sequelize) => {
    InsurancePolicyCargoConnect.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        modelName: 'InsurancePolicyCargoConnect',
        tableName: 'insurancePolicyCargoConnect',
        schema: 'insurance',
        timestamps: false,
    })
};

export { InsurancePolicyCargoConnect, initInsurancePolicyCargoConnect };