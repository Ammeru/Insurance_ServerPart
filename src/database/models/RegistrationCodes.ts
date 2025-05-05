import { Model, DataTypes, Sequelize } from '@sequelize/core';

interface CodeAttributes {
    email: string;
    code: string;
    expiresAt: Date;
}

class RegCodes extends Model<CodeAttributes> implements CodeAttributes {
    public email!: string;
    public code!: string;
    public expiresAt!: Date;
}

const initRegCodeModel = (sequelize: Sequelize) => {
    RegCodes.init({
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'RegistrationCodes',
        tableName: 'registrations',
        schema: 'insurance',
        timestamps: false,
    });
};

export { CodeAttributes, RegCodes, initRegCodeModel }