import { Model, DataTypes } from "sequelize";
import newSequelize from "../infra/sequelize";

export interface OutletReceiptSequenceInterface {
    id?: number;
    outletId: number;
    lastNumber: number;
    createdAt?: Date;
    updatedAt?: Date;
}

class OutletReceiptSequence extends Model<OutletReceiptSequenceInterface> implements OutletReceiptSequenceInterface {
    public id?: number;
    public outletId!: number;
    public lastNumber!: number;
    public readonly createdAt?: Date;
    public readonly updatedAt?: Date;
}

OutletReceiptSequence.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        outletId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        lastNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        tableName: "outlet_receipt_sequences",
        freezeTableName: true,
        timestamps: true,
        underscored: false,
        sequelize: newSequelize(),
        modelName: "outlet_receipt_sequences",
    }
);

export default OutletReceiptSequence;
