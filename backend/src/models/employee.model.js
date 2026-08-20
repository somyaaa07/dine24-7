import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Empolyee extends Model {}

Empolyee.init({
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    user_id:{
        type:DataTypes.UUID,
        allowNull:true
    },
    shift_id:{
        type:DataTypes.UUID,
        allowNull:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:true
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:true
    },
    role:{
        type:DataTypes.ENUM('manager','chef','waiter','cashier','cleaner','delivery','other'),
        defaultValue:"waiter"
    },
    salary:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
    },
    salary_type:{
        type:DataTypes.ENUM('hourly','monthly','daily'),
        defaultValue:"monthly"
    },
    join_date:{
        type:DataTypes.DATEONLY,
        allowNull:true
    },
    address:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    emergency_contact:{
        type:DataTypes.STRING,
        allowNull:true
    },
    id_proof:{
        type:DataTypes.STRING,
        allowNull:true
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }

},{
    sequelize,
    modelName:"Employee",
    tableName:"employees",
    timestamps:true
})

export default Empolyee