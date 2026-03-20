import { Model, DataTypes } from "sequelize";
import newSequelize from "../infra/sequelize";
import { MasterMenuItemInterface } from "./masterMenuItem";

export interface OutletMenuItemInterface {
    id?: number;
    outletId: number;
    masterMenuItemId: number;
    overridePrice?: number | null;
    isAvailable?: boolean;
    masterMenuItem?: MasterMenuItemInterface;
    createdAt?: Date;
    updatedAt?: Date;
}

class OutletMenuItem extends Model<OutletMenuItemInterface> implements OutletMenuItemInterface {
    public id?: number;
    public outletId!: number;
    public masterMenuItemId!: number;
    public overridePrice?: number | null;
    public isAvailable?: boolean;
    public masterMenuItem?: MasterMenuItemInterface;
    public readonly createdAt?: Date;
    public readonly updatedAt?: Date;
}

OutletMenuItem.init(
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
        overridePrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            get() {
                const value = this.getDataValue("overridePrice");
                return value === null || value === undefined ? value : Number(value);
            }
        },
        isAvailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "outlet_menu_items",
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
        modelName: "OutletMenuItem",
    }
);

export default OutletMenuItem;
