import { Model, DataTypes, Sequelize } from '@sequelize/core';
import {Risk} from "./InsurancePolicies";

enum CargoType {
    GENERAL = "general", // Общий груз
    PERISHABLE = "perishable", // Скоропортящийся
    HAZARDOUS = "hazardous", // Опасный
    FRAGILE = "fragile", // Хрупкий
    LIQUID = "liquid", // Жидкость
    VALUABLE = "valuable", // Ценный
}

interface CargoAttributes {
    id: number;

    cargoName: string; // Наименование груза
    cargoType: CargoType; // Тип груза
    cargoValue: number; // Стоимость груза
    cargoWeight: number; // Вес груза
    fromCity: string;
    toCity: string;
    deliveryDate: Date;

    riskLevel: string;
    riskReason: string;
}

type CargoCreationAttributes = Omit<CargoAttributes, 'id'>;

class Cargos extends Model<CargoAttributes, CargoCreationAttributes> implements CargoAttributes {
    public id!: number;

    public cargoName!: string;
    public cargoType!: CargoType;
    public cargoValue!: number;
    public cargoWeight!: number;
    public fromCity!: string;
    public toCity!: string;
    public deliveryDate!: Date;

    public riskLevel!: Risk;
    public riskReason!: string;
}

const initCargoModel = (sequelize: Sequelize) => {
    Cargos.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        cargoName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cargoType: {
            type: DataTypes.ENUM(...Object.values(CargoType)),
            allowNull: false,
            defaultValue: CargoType.GENERAL,
        },
        cargoValue: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cargoWeight: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fromCity: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        toCity: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        deliveryDate: {
            type: DataTypes.DATE,
            allowNull: false,
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
    }, {
        sequelize,
        modelName: 'Cargos',
        tableName: 'cargos',
        schema: 'insurance',
        timestamps: false,
    });
};

export { Cargos, CargoType, initCargoModel }