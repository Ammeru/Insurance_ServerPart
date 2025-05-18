import { Model, DataTypes, Sequelize } from '@sequelize/core';

enum InsuranceType {
    CARGO = "cargo", // Страхование груза
    LIABILITY = "liability", // Страхование ответственности перевозчика
    COMPLEX = "complex", // Комплексное страхование
}

enum Status {
    PENDING = "pending", // Рассмотрение
    CONFIRMED = "confirmed", // Подтверждён
    DECLINED = "declined", // Отклонено
    PAID = "paid", // Оплачен
    ACTIVE = "active", // Активна
    EXPIRED = "expired", // Срок действия истёк
}

enum Risk {
    LOW = "low", // Низкий
    MEDIUM = "medium", // Средний
    HIGH = "high", // Высокий
}

interface InsuranceAttributes {
    id: number;
    userId: number;
    insuranceType: InsuranceType;
    startDate: Date;
    endDate: Date;
    status: Status;
    amount: number;
}

type InsuranceCreationAttributes = Omit<InsuranceAttributes, 'id'>;

class InsurancePolicies extends Model<InsuranceAttributes, InsuranceCreationAttributes> implements InsuranceAttributes {
    public id!: number;
    public userId!: number;
    public insuranceType!: InsuranceType;
    public startDate!: Date;
    public endDate!: Date;
    public status!: Status;
    public amount!: number;
}

const initInsuranceModel = (sequelize: Sequelize) => {
    InsurancePolicies.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
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
            defaultValue: Status.PENDING,
        },
        amount: {
            type: DataTypes.FLOAT,
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

export { InsurancePolicies, InsuranceType, Status, Risk, initInsuranceModel }