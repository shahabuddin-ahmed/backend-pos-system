import { Model, DataTypes } from "sequelize";
import newSequelize from "../infra/sequelize";

export interface MasterMenuItemInterface {
    id?: number;
    name: string;
    sku: string;
    basePrice: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

class MasterMenuItem extends Model<MasterMenuItemInterface> implements MasterMenuItemInterface {
    public id?: number;
    public name!: string;
    public sku!: string;
    public basePrice!: number;
    public isActive?: boolean;
    public readonly createdAt?: Date;
    public readonly updatedAt?: Date;
}

MasterMenuItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: new DataTypes.STRING(150),
            allowNull: false,
        },
        sku: {
            type: new DataTypes.STRING(80),
            allowNull: false,
            unique: true,
        },
        basePrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "master_menu_items",
        freezeTableName: true,
        timestamps: true,
        underscored: false,
        sequelize: newSequelize(),
        modelName: "master_menu_items",
    }
);

export default MasterMenuItem;
