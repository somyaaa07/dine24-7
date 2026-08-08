import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Payroll extends Model{}

Payroll.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    employee_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    month:{
        type:DataTypes.STRING,
        allowNull:false
    },
    year:{
        type:DataTypes.STRING,
        allowNull:false
    },
    days_worked:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    days_absent:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    basic_salary:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
    },
    deductions:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
    },
    bonuses:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
    },
    net_salary:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
    },
    status:{
        type:DataTypes.ENUM('pending','paid'),
        defaultValue:'pending'
    },
    paid_at:{
        type:DataTypes.DATE,
        allowNull:true
    },
    note:{
        type:DataTypes.TEXT,
        allowNull:true
    }
    
},{
    sequelize,
    modelName:"Payroll",
    tableName:"payroll",
    timestamps:true
})

export default Payroll;