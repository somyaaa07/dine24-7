import { Model , DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

class Resturant extends Model{}

Resturant.init({
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tenant_id:{
        type: DataTypes.UUID,
        allowNull:false,
        unique:true
    },
    resturant_name:{
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
    address:{
        type:DataTypes.STRING,
        allowNull:true
    },
    city:{
        type:DataTypes.STRING,
        allowNull:true
    },
    state:{
        type:DataTypes.STRING,
        allowNull:true
    },
    pincode:{
        type:DataTypes.STRING,
        allowNull:true
    },
    logoUrl:{
        type:DataTypes.STRING,
        allowNull:true
    }
},
{
    sequelize,
    modelName:'Resturant',
    tableName:'resturant',
    timestamps:true
})
export default Resturant;