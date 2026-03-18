import { Model, DataTypes } from "sequelize";
import newSequelize from "../infra/sequelize";

export interface SaleItemInterface {
    id?: number;
    saleId: number;
    masterMenuItemId: number;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    createdAt?: Date;
    updatedAt?: Date;
}

class SaleItem extends Model<SaleItemInterface> implements SaleItemInterface {
    public id?: number;
    public saleId!: number;
    public masterMenuItemId!: number;
    public quantity!: number;
    public unitPrice!: number;
    public lineTotal!: number;
    public readonly createdAt?: Date;
    public readonly updatedAt?: Date;
}

SaleItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        saleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        masterMenuItemId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unitPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        lineTotal: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
    },
    {
        tableName: "sale_items",
        freezeTableName: true,
        timestamps: true,
        underscored: false,
        sequelize: newSequelize(),
        modelName: "SaleItem",
    }
);

export default SaleItem;
