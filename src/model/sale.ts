import { Model, DataTypes } from "sequelize";
import newSequelize from "../infra/sequelize";

export interface SaleInterface {
    id?: number;
    outletId: number;
    receiptNumber: string;
    totalAmount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

class Sale extends Model<SaleInterface> implements SaleInterface {
    public id?: number;
    public outletId!: number;
    public receiptNumber!: string;
    public totalAmount!: number;
    public readonly createdAt?: Date;
    public readonly updatedAt?: Date;
}

Sale.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        outletId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        receiptNumber: {
            type: new DataTypes.STRING(80),
            allowNull: false,
        },
        totalAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
    },
    {
        tableName: "sales",
        freezeTableName: true,
        timestamps: true,
        underscored: false,
        indexes: [
            {
                unique: true,
                fields: ["outletId", "receiptNumber"],
            },
        ],
        sequelize: newSequelize(),
        modelName: "Sale",
    }
);

export default Sale;
