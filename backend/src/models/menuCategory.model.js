import { DataTypes,Model } from "sequelize";
import { sequelize } from "../config/database.js";

class MenuCategory extends Model {}

MenuCategory.init({
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
    description:{
        type:DataTypes.STRING,
        allowNull:true
    },
    image_url:{
        type:DataTypes.STRING,
        allowNull:true
    },
    sort_order:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }
},{
    sequelize,
    modelName:"MenuCategory",
    tableName:"menu_categories",
    timestamps:true
})

export default MenuCategory;