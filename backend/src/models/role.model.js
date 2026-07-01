import { DataTypes, Model  } from "sequelize";
import { sequelize } from "../config/database.js";

class Role extends Model{}

Role.init(
    {
        id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        name:{
            type:DataTypes.ENUM('owner','manager','waiter','chef'),
            allowNull:false
        },
        permissions:{
            type:DataTypes.JSON,
            allowNull:false,
            defaultValue:{}
        },
        is_custom:{
            type:DataTypes.BOOLEAN,
            defaultValue:false
        }

},
{
    sequelize,
    modelName:'Role',
    tableName:'role',
    timestamps:true
}
)

export default Role;