import { Model, DataTypes } from "sequelize";
import newSequelize from "../infra/sequelize";

export interface OutletInterface {
    id?: number;
    name: string;
    code: string;
    location?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

class Outlet extends Model<OutletInterface> implements OutletInterface {
    public id?: number;
    public name!: string;
    public code!: string;
    public location?: string;
    public isActive?: boolean;
    public readonly createdAt?: Date;
    public readonly updatedAt?: Date;
}

Outlet.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: new DataTypes.STRING(120),
            allowNull: false,
        },
        code: {
            type: new DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        location: {
            type: new DataTypes.STRING(255),
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "outlets",
        freezeTableName: true,
        timestamps: true,
        underscored: false,
        sequelize: newSequelize(),
        modelName: "Outlet",
    }
);

export default Outlet;
