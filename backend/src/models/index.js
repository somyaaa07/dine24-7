import { sequelize } from "../config/database.js";
import { Op } from "sequelize";
import Role from "./role.model.js";
import Tenant from "./tenant.model.js";
import User from "./user.model.js";
import AuditLog from "./auditLog.model.js";
import RefreshToken from "./refreshToken.model.js";
import ResturantProfile from './resturant.model.js';
import Tables from './tables.model.js';
import MenuCategory from "./menuCategory.model.js";
import MenuItem from "./menuItem.model.js";
import MenuVariant from "./menuVariant.model.js";
import InventoryItem from "./inventoryItem.model.js";
import StockTransaction from "./stockTransaction.model.js";
import Supplier from "./supplier.model.js";
import PurchaseOrder     from './purchaseOrder.js';
import PurchaseOrderItem from './purchaseOrderItem.js';
import Recipe from './recipe.model.js';
import RecipeIngredients from './recipeIngredient.model.js'
import Order from "./order.model.js";
import OrderItem from './orderItem.model.js';

//relationship management

//tenant and user realtionship as user belongs to tenant
Tenant.hasMany(User,{foreignKey:"tenant_id"});
User.belongsTo(Tenant,{foreignKey:"tenant_id"});

//relationship between role and tenant as one tenant has many roles
Tenant.hasMany(Role,{foreignKey:"tenant_id"});
Role.belongsTo(Tenant,{foreignKey:"tenant_id"});

//relationship between role and user that one user has many role
Role.hasMany(User,{foreignKey:"role_id"});
User.belongsTo(Role,{foreignKey:"role_id"});

//user and refreshtoken . one user can have many refresh tokens
User.hasMany(RefreshToken,{foreignKey:"user_id"});
RefreshToken.belongsTo(User,{foreignKey:"user_id"});

//audit log and user relationship as one user can have many audit logs means user can have many loggin and logout activities
User.hasMany(AuditLog,{foreignKey:"user_id"});
AuditLog.belongsTo(User,{foreignKey:"user_id"});

//audit log and tenant relationship as one tenant can have many audit logs
Tenant.hasMany(AuditLog,{foreignKey:"tenant_id"});
AuditLog.belongsTo(Tenant,{foreignKey:"tenant_id"})

//relationship between resturant profile and tenant as one tenant has many resturant profiles
Tenant.hasMany(ResturantProfile,{foreignKey:"tenant_id"});
ResturantProfile.belongsTo(Tenant,{foreignKey:"tenant_id"});

Tenant.hasMany(Tables,{foreignKey:"tenant_id"});
Tables.belongsTo(Tenant,{foreignKey:"tenant_id"});

Tenant.hasMany(MenuCategory,{foreignKey:"tenant_id"});
MenuCategory.belongsTo(Tenant,{foreignKey:"tenant_id"});

MenuCategory.hasMany(MenuItem,{foreignKey:"category_id"});
MenuItem.belongsTo(MenuCategory,{foreignKey:"category_id"});

Tenant.hasMany(MenuItem,{foreignKey:"tenant_id"});
MenuItem.belongsTo(Tenant,{foreignKey:"tenant_id"});

MenuItem.hasMany(MenuVariant,{foreignKey:"menu_item_id"});
MenuVariant.belongsTo(MenuItem,{foreignKey:"menu_item_id"});

Tenant.hasMany(MenuVariant,{foreignKey:"tenant_id"});
MenuVariant.belongsTo(Tenant,{foreignKey:"tenant_id"});

Tenant.hasMany(InventoryItem,{foreignKey:"tenant_id"});
InventoryItem.belongsTo(Tenant,{foreignKey:"tenant_id"});

InventoryItem.hasMany(StockTransaction,{foreignKey:'inventory_item_id'});
StockTransaction.belongsTo(InventoryItem,{foreignKey:'inventory_item_id'});

Tenant.hasMany(StockTransaction,{foreignKey:'tenant_id'});
StockTransaction.belongsTo(Tenant,{foreignKey:'tenant_id'});

Tenant.hasMany(Supplier,{foreignKey:"tenant_id"});
Supplier.belongsTo(Tenant,{foreignKey:"tenant_id"});

Tenant.hasMany(PurchaseOrder,   { foreignKey: 'tenant_id' });
PurchaseOrder.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Supplier.hasMany(PurchaseOrder,     { foreignKey: 'supplier_id' });
PurchaseOrder.belongsTo(Supplier,   { foreignKey: 'supplier_id' });

PurchaseOrder.hasMany(PurchaseOrderItem,     { foreignKey: 'purchase_order_id' });
PurchaseOrderItem.belongsTo(PurchaseOrder,   { foreignKey: 'purchase_order_id' });

InventoryItem.hasMany(PurchaseOrderItem,     { foreignKey: 'inventory_item_id' });
PurchaseOrderItem.belongsTo(InventoryItem,   { foreignKey: 'inventory_item_id' });

MenuItem.hasMany(Recipe, {foreignKey:"menu_item_id"});
Recipe.belongsTo(MenuItem,{foreignKey:"menu_item_id"})

Tenant.hasMany(Recipe, {foreignKey:"tenant_id"});
Recipe.belongsTo(Tenant,{foreignKey:"tenant_id"})

Recipe.hasMany(RecipeIngredients,{foreignKey:"recipe_id"});
RecipeIngredients.belongsTo(Recipe,{foreignKey:"recipe_id"})

InventoryItem.hasMany(RecipeIngredients,{foreignKey:"inventory_item_id"});
RecipeIngredients.belongsTo(InventoryItem,{foreignKey:"inventory_item_id"});

Tenant.hasMany(RecipeIngredients,{foreignKey:"tenant_id"});
RecipeIngredients.belongsTo(Tenant,{foreignKey:"tenant_id"});

Tenant.hasMany(Order,{foreignKey:"tenant_id"});
Order.belongsTo(Tenant,{foreignKey:"tenant_id"});

Tables.hasMany(Order,{foreignKey:"table_id"});
Order.belongsTo(Tables,{foreignKey:"table_id"});

Order.hasMany(OrderItem,{foreignKey:"order_id"});
OrderItem.belongsTo(Order,{foreignKey:"order_id"});

MenuItem.hasMany(OrderItem,{foreignKey:"menu_item_id"});
OrderItem.belongsTo(MenuItem,{foreignKey:"menu_item_id"});

Tenant.hasMany(OrderItem,{foreignKey:"tenant_id"});
OrderItem.belongsTo(Tenant,{foreignKey:"tenant_id"})


export {
  sequelize,
  Tenant,
  User,
  Role,
  RefreshToken,
  AuditLog,
  ResturantProfile,
  Tables,
  MenuCategory,
  MenuItem,
  MenuVariant,
  InventoryItem,
  StockTransaction,
  Supplier,
  PurchaseOrder, PurchaseOrderItem  ,
  Recipe,
  RecipeIngredients,
  Order,
  OrderItem
};
