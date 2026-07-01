import { Model , DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

class User extends Model {}

User.init(
    {
        id:{
            type:DataTypes.UUID,
            defaultValue:DataTypes.UUIDV4,
            primaryKey:true
        },
        tenant_id:{
            type:DataTypes.UUID,
            allowNull:false,
            references:{
                model:'tenants',
                key:'id'
            },

        },
        name:{
            type:DataTypes.STRING,
            allowNull:false
        },
        email:{
            type:DataTypes.STRING,
            allowNull:false,
            validate:{
                isEmail:true
            }
        }
        ,
        password_hash:{
            type:DataTypes.STRING,
            allowNull:false
        },
        role_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        is_active:{
            type:DataTypes.BOOLEAN,
            defaultValue:true
        },
        last_log_at:{
            type:DataTypes.DATE
        },
        

    },
    {
        sequelize,
        modelName:'User',
        tableName:'user',
        timestamps:true,
        indexes:[
            {
                unique:true,
                fields:['email','tenant_id']
            }
        ]


    }
)