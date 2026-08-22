import {Model , DataTypes} from 'sequelize';
import { sequelize } from '../config/database.js';

class Branch extends Model {}

Branch.init({
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
    address:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phone:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    is_main:{
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
    modelName:'Branch',
    tableName:'branches',
    timestamps:true
})

export default Branch;