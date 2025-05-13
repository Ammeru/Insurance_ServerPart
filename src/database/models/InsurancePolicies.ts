import { Model, DataTypes, Sequelize } from '@sequelize/core';

enum InsuranceType {
    CARGO = "cargo", // Страхование груза
    LIABILITY = "liability", // Страхование ответственности перевозчика
    COMPLEX = "complex", // Комплексное страхование
}

enum Status {
    DRAFT = "draft", // Черновик
    PENDING = "pending", // Рассмотрение
    CONFIRMED = "confirmed", // Подтверждён
    PAID = "paid", // Оплачен
    EXPIRED = "expired", // Срок действия истёк
}

enum Risk {
    LOW = "low", // Низкий
    MEDIUM = "medium", // Средний
    HIGH = "high", // Высокий
}

interface InsuranceAttributes {
    id: number;
    user_id: number;
    insuranceType: InsuranceType;
    startDate: Date;
    endDate: Date;
    status: Status;

    riskLevel: Risk;
    riskReason: string;

    cost: number;
}

type InsuranceCreationAttributes = Omit<InsuranceAttributes, 'id'>;
type InsuranceUpdateAttributes = Partial<InsuranceAttributes>;

class InsurancePolicies extends Model<InsuranceAttributes, InsuranceCreationAttributes> implements InsuranceAttributes {
    public id!: number;
    public user_id!: number;
    public insuranceType!: InsuranceType;
    public startDate!: Date;
    public endDate!: Date;
    public status!: Status;

    public riskLevel!: Risk;
    public riskReason!: string;

    public cost!: number;
}

const initInsuranceModel = (sequelize: Sequelize) => {
    InsurancePolicies.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        insuranceType: {
            type: DataTypes.ENUM(...Object.values(InsuranceType)),
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(Status)),
            allowNull: false,
            defaultValue: Status.DRAFT,
        },
        riskLevel: {
            type: DataTypes.ENUM(...Object.values(Risk)),
            allowNull: false,
            defaultValue: Risk.LOW,
        },
        riskReason: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cost: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'InsurancePolicies',
        tableName: 'insurancePolicies',
        schema: 'insurance',
        timestamps: false,
    });
};

export { InsuranceAttributes, InsuranceCreationAttributes, InsuranceUpdateAttributes, InsurancePolicies,
    InsuranceType, Status, Risk, initInsuranceModel }