import { Model, DataTypes, Sequelize } from '@sequelize/core';

enum RiskLevel {
    LOW = "low", // Низкий
    MEDIUM = "medium", // Средний
    HIGH = "high", // Высокий
}

interface RiskAttributes {
    id: number;

    riskLevel: RiskLevel;
    riskReason: string;
}

type RiskCreationAttributes = Omit<RiskAttributes, 'id'>;

class Risk extends Model<RiskAttributes, RiskCreationAttributes> {
    public id!: number;

    public riskLevel!: Risk;
    public riskReason!: string;
}

const initRiskModel = (sequelize: Sequelize) => {
    Risk.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        riskLevel: {
            type: DataTypes.ENUM(...Object.values(RiskLevel)),
            allowNull: false,
            defaultValue: RiskLevel.LOW,
        },
        riskReason: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Risk',
        tableName: 'risk',
        schema: 'insurance',
        timestamps: false,
    });
}

export { Risk, RiskLevel, initRiskModel };