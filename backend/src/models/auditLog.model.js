import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class AuditLog extends Model {}

AuditLog.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    user_id:{
        type:DataTypes.UUID,
        allowNull:true
    },
    action:{
        type:DataTypes.ENUM(
            "REGISTER",
            "LOGIN",
            "LOGOUT",
            "LOGIN_FAILED",
            "PASSWORD_RESET",
            "TOKEN_REFRESHED"
        ), allowNull:false
    },
    ip_address:{
        type:DataTypes.STRING,
        allowNull:true
    },
    details:{
        type:DataTypes.JSON,
        allowNull:true
    }
},
{
    sequelize,
    modelName:"AuditLog",
    tableName:"audit_logs",
    timestamps:true,
})

export default AuditLog;