import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Customer extends Model {}

Customer.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:false
    },
    birthday:{
        type:DataTypes.DATEONLY,
        allowNull:true
    },
    aniversary:{
        type:DataTypes.DATEONLY,
        allowNull:true
    },
    total_visits:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    total_spent:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
    },
    loyalty_points:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    notes:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }   
},{
    sequelize,
    modelName:"Customer",
    tableName:"customers",
    timestamps:true
})

export default Customer;