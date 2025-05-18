import { Model, DataTypes, Sequelize} from "@sequelize/core";

enum Status {
    PENDING = 'pending',
    PAID = 'paid',
    REFUNDED = 'refunded',
}

interface PaymentAttributes {
    id: number;
    insuranceId: number;
    amount: number;
    status: Status;
    paidAt?: Date | null;
}

type PaymentCreationAttributes = Omit<PaymentAttributes, 'id'>;

class Payments extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
    public id!: number;
    public insuranceId!: number;
    public amount!: number;
    public status!: Status;
    public paidAt?: Date | null;
}

const initPayments = (sequelize: Sequelize) => {
    Payments.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        insuranceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(Status)),
            allowNull: false,
            defaultValue: Status.PENDING,
        },
        paidAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Payments',
        tableName: 'payments',
        schema: 'insurance',
        timestamps: true,
    });
};

export { Payments, Status, initPayments };
