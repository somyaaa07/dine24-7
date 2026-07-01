import { Model , DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

class RefreshToken extends Model {}

RefreshToken.init({
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    user_id:{
        type:DataTypes.UUID,
        allowNull:false,
    },
    token:{
        type:DataTypes.TEXT,
        allowNull:false,
    },
    expires_at:{
        type:DataTypes.DATE,
        allowNull:false,
    },
    ip_address:{
        type:DataTypes.STRING,
        allowNull:false,
    },

},
{
    sequelize,
    modelName:"RefreshToken",
    tableName:"refresh_tokens",
    timestamps:true,

})

export default RefreshToken;