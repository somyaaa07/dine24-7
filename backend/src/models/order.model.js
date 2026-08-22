import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Order extends Model {}

Order.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tenant_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    branch_id:{
        type:DataTypes.UUID,
        allowNull:true
    },
    // table can be allowed to be null because it can be delivered
    table_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    order_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM(
            'pending',
            'preparing',
            'ready',
            'served',
            'paid',
            'cancelled'
        ),
        defaultValue: 'pending'
    },

    order_type:{
        type:DataTypes.ENUM(
            'dine-in',
            'takeaway',
            'delivery'
        ),
        defaultValue:'dine-in'
    },

    subtotal:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
    },
    tax_amount:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
    },

    discount_amount:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
    },

    total_amount:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
    },
    payment_method:{
        type:DataTypes.ENUM(
            'cash',
            'card',
            'upi',
            'wallet'
        ),
        defaultValue:'cash'
    },
    payment_status:{
        type:DataTypes.ENUM(
            'paid',
            'pending',
            'refunded'
        ),
        defaultValue:'pending'
    },

    note:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    customer_name:{
    type:DataTypes.STRING,
    allowNull:true
},
customer_email:{
    type:DataTypes.STRING,
    allowNull:true
},
customer_phone:{
    type:DataTypes.STRING,
    allowNull:true
},
    served_by:{
        type:DataTypes.UUID,
        allowNull:true
    }
},
{
    sequelize,
    modelName:'Orders',
    tableName:'orders',
    timestamps:true
})

export default Order;