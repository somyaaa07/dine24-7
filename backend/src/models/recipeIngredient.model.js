import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class RecipeIngredient extends Model {}

RecipeIngredient.init(
    {
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        tenant_id:{
            type:DataTypes.UUID,
            allowNull: false
        },
        recipe_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        inventory_item_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        quantity:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        },
        unit:{
            type:DataTypes.STRING,
            allowNull:false
        }
    },
    {
        sequelize,
        modelName: "RecipeIngredients",
        tableName: "recipe_ingredients",
        timestamps:true
    }
)

export default RecipeIngredient;