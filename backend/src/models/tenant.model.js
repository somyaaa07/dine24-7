import { Model , DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

class Tenant extends Model {}

Tenant.init(
    {
        id:{
            type:DataTypes.UUID,
            defaultValue:DataTypes.UUIDV4,
            primaryKey:true
        },
        name:{
            type:DataTypes.STRING,
            allowNull:false
        },
        subdomain:{
            type:DataTypes.STRING,
            allowNull:false,
            unique:true
        },
        plan:{
            type:DataTypes.ENUM('starter','growth','enterprise'),
            defaultValue:'starter'
        },
        status:{
            type:DataTypes.ENUM(
                'Trial',
                'Suspend',
                'active',
                'cancelled'
            ),
            defaultValue:'Trial'
        },
        trial_ends_at:{
            type:DataTypes.DATE
        }

    },
    {
        sequelize,
        modelName:'Tenant',
        tableName:'tenants',
        timestamps

    }
)

export default Tenant;