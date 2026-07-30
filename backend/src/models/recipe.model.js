import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Recipe extends Model {}

Recipe.init({
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
        allowNull:false,
        unique:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    serving_size:{
        type:DataTypes.INTEGER,
        defaultValue:1
    },
    preparation_time:{
        type:DataTypes.INTEGER,
        defaultValue:15
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }

},
{
    sequelize,
    modelName:"Recipe",
    tableName:"recipes",
    timestamps:true
})

export default Recipe;