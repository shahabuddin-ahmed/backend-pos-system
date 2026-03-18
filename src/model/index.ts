import Outlet from "./outlet";
import MasterMenuItem from "./masterMenuItem";
import OutletMenuItem from "./outletMenuItem";
import Inventory from "./inventory";
import Sale from "./sale";
import SaleItem from "./saleItem";
import OutletReceiptSequence from "./outletReceiptSequence";

Outlet.hasMany(OutletMenuItem, { foreignKey: "outletId" });
OutletMenuItem.belongsTo(Outlet, { foreignKey: "outletId" });

MasterMenuItem.hasMany(OutletMenuItem, { foreignKey: "masterMenuItemId" });
OutletMenuItem.belongsTo(MasterMenuItem, { foreignKey: "masterMenuItemId", as : "masterMenuItem" });

Outlet.hasMany(Inventory, { foreignKey: "outletId" });
Inventory.belongsTo(Outlet, { foreignKey: "outletId" });

MasterMenuItem.hasMany(Inventory, { foreignKey: "masterMenuItemId" });
Inventory.belongsTo(MasterMenuItem, { foreignKey: "masterMenuItemId" });

Outlet.hasMany(Sale, { foreignKey: "outletId" });
Sale.belongsTo(Outlet, { foreignKey: "outletId" });

Sale.hasMany(SaleItem, { foreignKey: "saleId", as: "items" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId" });

MasterMenuItem.hasMany(SaleItem, { foreignKey: "masterMenuItemId" });
SaleItem.belongsTo(MasterMenuItem, { foreignKey: "masterMenuItemId" });

Outlet.hasOne(OutletReceiptSequence, { foreignKey: "outletId" });
OutletReceiptSequence.belongsTo(Outlet, { foreignKey: "outletId" });

export {
    Outlet,
    MasterMenuItem,
    OutletMenuItem,
    Inventory,
    Sale,
    SaleItem,
    OutletReceiptSequence,
};
