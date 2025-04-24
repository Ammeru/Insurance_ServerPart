import { Model, DataTypes, Sequelize } from '@sequelize/core';

enum UserRole {
    USER = "user",
    ADMIN = "admin",
}

interface UserAttributes {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    role: UserRole;
}

type UserCreationAttributes = Omit<UserAttributes, 'id'>;
type UserUpdateAttributes = Partial<UserAttributes>;

class Users extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public email!: string;
    public password!: string;
    public firstName!: string;
    public lastName?: string;
    public role!: UserRole;
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
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM(...Object.values(UserRole)),
            allowNull: false,
            defaultValue: UserRole.USER,
        },
    }, {
        sequelize,
        modelName: 'Users',
        tableName: 'users',
        schema: 'insurance',
    });
};

export { UserAttributes, UserCreationAttributes, UserUpdateAttributes, Users, UserRole, initUserModel }