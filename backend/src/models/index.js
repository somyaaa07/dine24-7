import { sequelize } from "../config/database.js";
import Role from "./role.model.js";
import Tenant from "./tenant.model.js";
import User from "./user.model.js";
import AuditLog from "./auditLog.model.js";
import RefreshToken from "./refreshToken.model.js";

//relationship management

//tenant and user realtionship as user belongs to tenant
Tenant.hasMany(User,{foreignKey:"tenant_id"});
User.belongsTo(Tenant,{foreignKey:"tenant_id"});

//relationship between role and tenant as one tenant has many roles
Tenant.hasMany(Role,{foreignKey:"tenant_id"});
Role.belongsTo(Tenant,{foreignKey:"tenant_id"});

//relationship between role and user that one user has many role
User.hasMany(Role,{foreignKey:"role_id"});
Role.belongsTo(User,{foreignKey:"role_id"});

//user and refreshtoken . one user can have many refresh tokens
User.hasMany(RefreshToken,{foreignKey:"user_id"});
RefreshToken.belongsTo(User,{foreignKey:"user_id"});

//audit log and user relationship as one user can have many audit logs means user can have many loggin and logout activities
User.hasMany(AuditLog,{foreignKey:"user_id"});
AuditLog.belongsTo(User,{foreignKey:"user_id"});

//audit log and tenant relationship as one tenant can have many audit logs
Tenant.hasMany(AuditLog,{foreignKey:"tenant_id"});
AuditLog.belongsTo(Tenant,{foreignKey:"tenant_id"})


export default {
  sequelize,
  Tenant,
  User,
  Role,
  RefreshToken,
  AuditLog,
};
