import { Model, DataTypes, Sequelize } from '@sequelize/core';

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
    insurance_id: number;

    cargoName: string; // Наименование груза
    cargoType: CargoType; // Тип груза
    cargoValue: number; // Стоимость груза
    cargoWeight: number; // Вес груза
    cargoDescription: string; // Описание груза
}

type CargoCreationAttributes = Omit<CargoAttributes, 'id'>;

class Cargos extends Model<CargoAttributes, CargoCreationAttributes> implements CargoAttributes {
    public id!: number;
    public insurance_id!: number;

    public cargoName!: string;
    public cargoType!: CargoType;
    public cargoValue!: number;
    public cargoWeight!: number;
    public cargoDescription!: string;
}

const initCargoModel = (sequelize: Sequelize) => {
    Cargos.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        insurance_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cargoName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cargoType: {
            type: DataTypes.ENUM(...Object.values(CargoType)),
            allowNull: false,
        },
        cargoValue: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cargoWeight: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cargoDescription: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'Cargos',
        tableName: 'cargos',
        schema: 'insurance',
        timestamps: false,
    });
};

export { CargoAttributes, CargoCreationAttributes, Cargos,
    CargoType, initCargoModel }