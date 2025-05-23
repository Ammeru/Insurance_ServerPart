import { Model, DataTypes, Sequelize} from "@sequelize/core";

enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
}

interface PaymentAttributes {
    id: number;
    insuranceId: number;
    amount: number;
    paymentStatus: PaymentStatus;
    paidAt?: Date | null;
}

type PaymentCreationAttributes = Omit<PaymentAttributes, 'id'>;

class Payments extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
    public id!: number;
    public insuranceId!: number;
    public amount!: number;
    public paymentStatus!: PaymentStatus;
    public paidAt?: Date | null;
}

const initPaymentsModel = (sequelize: Sequelize) => {
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
        paymentStatus: {
            type: DataTypes.ENUM(...Object.values(PaymentStatus)),
            allowNull: false,
            defaultValue: PaymentStatus.PENDING,
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

export { Payments, PaymentStatus, initPaymentsModel };
