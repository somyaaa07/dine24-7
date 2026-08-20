import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Shift extends Model {}

Shift.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    start_time:{
        type:DataTypes.TIME,
        allowNull:false
    },
    end_time:{
        type:DataTypes.TIME,
        allowNull:false
    },
    grace_mintue:{
        type:DataTypes.INTEGER,
        defaultValue:10
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }
    
},
{
    sequelize,
    modelName:"Shift",
    tableName:"shifts",
    timestamps:true
})

export default Shift;