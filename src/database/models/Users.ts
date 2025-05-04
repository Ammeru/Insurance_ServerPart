import { Model, DataTypes, Sequelize } from '@sequelize/core';

enum UserRole {
    USER = "user", // Пользователь
    ADMIN = "admin", // Администратор
}

enum ClientType {
    PHYSICAL = "physical", // Физическое лицо
    LEGAL = "legal", // Юридическое лицо
}

interface UserAttributes {
    id: number;
    email: string;
    password: string;
    role: UserRole;
    clientType: ClientType;
    phone: string;
    unp?: string | null;
}

type UserCreationAttributes = Omit<UserAttributes, 'id'>;
type UserUpdateAttributes = Partial<UserAttributes>;

class Users extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public email!: string;
    public password!: string;
    public role!: UserRole;
    public clientType!: ClientType;
    public phone!: string;
    public unp?: string | null;
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
        role: {
            type: DataTypes.ENUM(...Object.values(UserRole)),
            allowNull: false,
            defaultValue: UserRole.USER,
        },
        clientType: {
            type: DataTypes.ENUM(...Object.values(ClientType)),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        unp: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: 'Users',
        tableName: 'users',
        schema: 'insurance',
    });
};

export { UserAttributes, UserCreationAttributes, UserUpdateAttributes, Users, UserRole, ClientType, initUserModel }