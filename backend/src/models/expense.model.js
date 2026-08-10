import { DataTypes , Model } from "sequelize";
import {sequelize} from "../config/database.js";

class Expense extends Model{}

Expense.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    title:{
        type:DataTypes.STRING,
        allowNull:false
    },
    category:{
        type:DataTypes.ENUM('electricity','water','gas','maintenance','marketing','salary','suppliers','other'),
        defaultValue:'other'
    },
    amount:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false
    },
    expense_date:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },
    payment_method:{
        type:DataTypes.ENUM('cash','card','upi','bank'),
        defaultValue:'cash'
    },
    receipt_url:{
        type:DataTypes.STRING,
        allowNull:true
    },
    note:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    added_by:{
        type:DataTypes.UUID,
        allowNull:false
    }

},{
    sequelize,
    modelName:'Expense',
    tableName:'expenses',
    timestamps:true
})

export default Expense;