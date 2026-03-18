import { Model, DataTypes } from "sequelize";
import newSequelize from "../infra/sequelize";

export interface InventoryInterface {
    id?: number;
    outletId: number;
    masterMenuItemId: number;
    currentStock: number;
    createdAt?: Date;
    updatedAt?: Date;
}

class Inventory extends Model<InventoryInterface> implements InventoryInterface {
    public id?: number;
    public outletId!: number;
    public masterMenuItemId!: number;
    public currentStock!: number;
    public readonly createdAt?: Date;
    public readonly updatedAt?: Date;
}

Inventory.init(
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
        masterMenuItemId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        currentStock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        tableName: "inventories",
        freezeTableName: true,
        timestamps: true,
        underscored: false,
        indexes: [
            {
                unique: true,
                fields: ["outletId", "masterMenuItemId"],
            },
        ],
        sequelize: newSequelize(),
        modelName: "Inventory",
    }
);

export default Inventory;
