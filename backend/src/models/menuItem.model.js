import { DataTypes , Model } from "sequelize";
import {sequelize} from '../config/database.js'

class MenuItem extends Model{}

MenuItem.init({
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    category_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    price:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false
    },
    image_url:{
        type:DataTypes.STRING,
        allowNull:true
    },
    food_type:{
        type:DataTypes.ENUM('VEG','NON-VEG','VEGAN','EGG'),
        defaultValue:'VEG'
    },
    is_available:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    },
    sort_order:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    caleories:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    preparation_time:{
        type:DataTypes.INTEGER,
        defaultValue:15
    }
},
{
    sequelize,
    modelName:'MenuItem',
    tableName:'menu_items',
    timestamps:true
})

export default MenuItem;