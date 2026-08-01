import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

class Resturant extends Model {}

Resturant.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
    },
    resturant_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pincode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // NEW: fields the controller was already trying to save but didn't exist
    gstin: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tax_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 5.00
    },
    tax_inclusive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'INR'
    },
    currency_symbol: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '₹'
    },
    working_hours: {
        type: DataTypes.JSON,
        allowNull: true
    },
    receipt_header: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    receipt_footer: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    show_logo_on_receipt: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    },
    logo_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
},
{
    sequelize,
    modelName: 'Resturant',
    tableName: 'resturant',
    timestamps: true
})
export default Resturant;