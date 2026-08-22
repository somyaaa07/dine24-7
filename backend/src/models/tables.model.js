import {Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

class Tables extends Model {}

Tables.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    branch_id:{
        type:DataTypes.UUID,
        allowNull:true
    },
    table_number:{
        type:DataTypes.STRING,
        allowNull:false
    },
    section:{
        type:DataTypes.STRING,
        defaultValue:'Main Hall'
    },
    capacity:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:4
    },
    status:{
        type:DataTypes.ENUM(
            'available',
            'occupied',
            'reserved',
            'cleaning'
        ),
        defaultValue:'available'

    },
    qr_code:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }
  },
  { sequelize,  
    tableName: "tables",
      modelName: 'Tables',
    timestamps: true,
    indexes:[
        {
            unique:true,
            fields:['tenant_id','table_number'],
            name:'tables_tenant_unique_number'
        }
    ]
    }
)

export default Tables;