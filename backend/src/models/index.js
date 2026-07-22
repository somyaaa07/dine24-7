import { sequelize } from "../config/database.js";
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
};
