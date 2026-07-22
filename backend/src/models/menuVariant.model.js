import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class MenuVariant extends Model {}

MenuVariant.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    menu_item_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    price:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false
    },
    is_default:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }
},
{
    sequelize,
    modelName:"MenuVariant",
    tableName:"menu_variants",
    timestamps:true
})

export default MenuVariant;