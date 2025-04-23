import { Model, DataTypes, Sequelize } from '@sequelize/core';

interface UserAttributes {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
}

type UserCreationAttributes = Omit<UserAttributes, 'id'>;
type UserUpdateAttributes = Partial<UserAttributes>;

class Users extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public email!: string;
    public password!: string;
    public firstName!: string;
    public lastName?: string;
}

const initUserModel = (sequelize: Sequelize) => {
    Users.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fio: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Users',
        tableName: 'users',
        schema: 'insurance',
    });
};

export { UserAttributes, UserCreationAttributes, UserUpdateAttributes, Users, initUserModel }