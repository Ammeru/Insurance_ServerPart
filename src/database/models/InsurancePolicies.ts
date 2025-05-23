import { Model, DataTypes, Sequelize } from '@sequelize/core';

enum InsuranceType {
    CARGO = "cargo", // Страхование груза
    RESPONSIBILITY = "responsibility", // Страхование ответственности
    MULTIPLE = "multiple", // Страхование на несколько перевозок (годовые)
}

enum InsuranceTariff {
    FULL = "full",
    MID = "mid",
    LOW = "low",
}

enum InsuranceStatus {
    PENDING = "pending", // Рассмотрение
    CONFIRMED = "confirmed", // Подтверждён
    DECLINED = "declined", // Отклонено
    PAID = "paid", // Оплачен
    ACTIVE = "active", // Активна
    EXPIRED = "expired", // Срок действия истёк
}

interface InsuranceAttributes {
    id: number;
    userId: number;
    insuranceType: InsuranceType;
    insuranceTariff: InsuranceTariff;
    startDate: Date;
    endDate: Date;
    insuranceStatus: InsuranceStatus;
    amount: number;
}

type InsuranceCreationAttributes = Omit<InsuranceAttributes, 'id'>;

class InsurancePolicies extends Model<InsuranceAttributes, InsuranceCreationAttributes> implements InsuranceAttributes {
    public id!: number;
    public userId!: number;
    public insuranceType!: InsuranceType;
    public insuranceTariff!: InsuranceTariff;
    public startDate!: Date;
    public endDate!: Date;
    public insuranceStatus!: InsuranceStatus;
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
        insuranceTariff: {
            type: DataTypes.ENUM(...Object.values(InsuranceTariff)),
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
        insuranceStatus: {
            type: DataTypes.ENUM(...Object.values(InsuranceStatus)),
            allowNull: false,
            defaultValue: InsuranceStatus.PENDING,
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

export { InsurancePolicies, InsuranceType, InsuranceTariff, InsuranceStatus, initInsuranceModel }