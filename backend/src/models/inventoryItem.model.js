import { DataTypes , Model } from "sequelize";
import { sequelize } from '../config/database.js'

class InventoryItem extends Model {}

InventoryItem.init({
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
    category:{
        type:DataTypes.STRING,
        allowNull:true
    },
    unit:{
        type:DataTypes.ENUM('kg','g','litre','ml','pieces','dozen','packet'),
        allowNull:false,
        defaultValue:'kg'
    },
    current_quantity:{
        type:DataTypes.DECIMAL(10,3),
        defaultValue:0
    },
 minimum_threshold:{
    type:DataTypes.DECIMAL(10,3),
    defaultValue:0
},
    purchase_price:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }

},
{
    sequelize,
    modelName:'IventoryItem',
    tableName:'inventory_items',
    timestamps:true
}
)

export default InventoryItem;