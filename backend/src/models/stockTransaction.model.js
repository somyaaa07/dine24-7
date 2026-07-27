import { DataTypes , Model } from "sequelize";
import {sequelize } from '../config/database.js'

class stockTransaction extends Model{}

stockTransaction.init({
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    inventory_item_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    type:{
        type:DataTypes.ENUM(
            'stock_in',
            'stock_out',
            'adjustment',
            'waste'
        ),
        allowNull:false
    },
    quantity:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false
    },
    note:{
        type:DataTypes.STRING,
        allowNull:true
    },
    performed_by:{
        type:DataTypes.UUID,
        allowNull:false
    }
},
{
    sequelize,
    modelName:'stockTransaction',
    tableName:'stock_transactions',
    timestamp:true
});
export default stockTransaction;