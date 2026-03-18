import Outlet from "./outlet";
import MasterMenuItem from "./masterMenuItem";
import OutletMenuItem from "./outletMenuItem";
import Inventory from "./inventory";
import Sale from "./sale";
import SaleItem from "./saleItem";
import OutletReceiptSequence from "./outletReceiptSequence";

Outlet.hasMany(OutletMenuItem, { foreignKey: "outletId", as: "outletMenuItems" });
OutletMenuItem.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });

MasterMenuItem.hasMany(OutletMenuItem, { foreignKey: "masterMenuItemId", as: "outletMenuItems" });
OutletMenuItem.belongsTo(MasterMenuItem, { foreignKey: "masterMenuItemId", as : "masterMenuItem" });

Outlet.hasMany(Inventory, { foreignKey: "outletId", as: "inventories" });
Inventory.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });

MasterMenuItem.hasMany(Inventory, { foreignKey: "masterMenuItemId", as: "inventories" });
Inventory.belongsTo(MasterMenuItem, { foreignKey: "masterMenuItemId", as: "masterMenuItem" });

Outlet.hasMany(Sale, { foreignKey: "outletId", as: "sales" });
Sale.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });

Sale.hasMany(SaleItem, { foreignKey: "saleId", as: "items" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId", as: "sale" });

MasterMenuItem.hasMany(SaleItem, { foreignKey: "masterMenuItemId", as: "saleItems" });
SaleItem.belongsTo(MasterMenuItem, { foreignKey: "masterMenuItemId", as: "masterMenuItem" });

Outlet.hasOne(OutletReceiptSequence, { foreignKey: "outletId", as: "receiptSequence" });
OutletReceiptSequence.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });

export {
    Outlet,
    MasterMenuItem,
    OutletMenuItem,
    Inventory,
    Sale,
    SaleItem,
    OutletReceiptSequence,
};
