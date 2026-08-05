import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Reservation extends Model {}

Reservation.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    customer_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    customer_phone:{
        type:DataTypes.STRING,
        allowNull:false
    },
    customer_id:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    table_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    reservation_date:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },
    reservation_time:{
        type:DataTypes.STRING,
        allowNull:false
    },
    guests:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:2
    },
    status:{
        type:DataTypes.ENUM('pending',
            'confirmed',
            'seated',
            'completed',
            'cancelled',
            'no-show'
        ),
        defaultValue:'pending'
    },
    special_requests:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    notes:{
        type:DataTypes.TEXT,
        allowNull:true
    }
},{
    sequelize,
    modelName:'Reservation',
    tableName:'reservations',
    timestamps:true
})

export default Reservation;