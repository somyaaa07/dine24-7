import { DataTypes,Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Supplier extends Model{}

Supplier.init({
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
    contact_person:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    address:{
        type:DataTypes.STRING,
        allowNull:false
    },
    payment_terms:{
        type:DataTypes.ENUM('immediate',
            'net_7',
            'net_15',
            'net_30',
        ),
        defaultValue:'immediate'
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }
},{
    sequelize,
    modelName:'supplier',
    tableName:'suppliers',
    timestamps:true
    
})

export default Supplier;