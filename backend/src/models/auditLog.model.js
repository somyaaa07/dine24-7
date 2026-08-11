import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class AuditLog extends Model { }

AuditLog.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tenant_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    action: {
        type: DataTypes.ENUM(
            "REGISTER",
            "LOGIN",
            "LOGOUT",
            "LOGIN_FAILED",
            "PASSWORD_RESET",
            "TOKEN_REFRESHED",
            "TABLE_CREATED",
            "TABLE_DELETED",
            "TABLE_STATUS_UNCHANGED",
            "SUPPLIER_CREATED",
            "SUPPLIER_DELETED",
            'PO_CREATED',
            'PO_STATUS_UPDATED',
            'ORDER_CREATED',
            'ORDER_PAID',
            'RECIPE_CREATED', 'STOCK_ADJUSTED',
            'SUPPLIER_CREATED', 'SUPPLIER_DELETED',
            'PO_CREATED', 'PO_STATUS_UPDATED',
            'INVENTORY_ITEM_CREATED'
        ), allowNull: false
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    details: {
        type: DataTypes.JSON,
        allowNull: true
    }
},
    {
        sequelize,
        modelName: "AuditLog",
        tableName: "audit_logs",
        timestamps: true,
    })

export default AuditLog;