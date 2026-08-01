import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class OrderItem extends Model {}

OrderItem.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    order_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    menu_item_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    menu_variant_id:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    quantity:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:1
    },
    unit_price:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false
    },
    total_price:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false
    },
    status:{
        type:DataTypes.ENUM('pending','preparing','ready','served','cancelled'),
        allowNull:false,
    },
    note:{
        type:DataTypes.TEXT,
        allowNull:true
    }
},
{
    sequelize,
    modelName:'OrderItem',
    tableName:'order_items',
    timestamps:true
}
)

export default OrderItem;
