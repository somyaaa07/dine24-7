import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Attendance extends Model {}

Attendance.init(
    {
        id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        tenant_id:{
            type:DataTypes.UUID,
            allowNull:false
        },
        employee_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        date:{
            type:DataTypes.DATEONLY,
            allowNull:false
        },
        check_in:{
            type:DataTypes.TIME,
            allowNull:true
        },
        check_out:{
            type:DataTypes.TIME,
            allowNull:true
        },
        shift_id:{
            type:DataTypes.UUID,
            allowNull:true
        },
        late_minutes:{
            type:DataTypes.INTEGER,
            defaultValue:0
        },
        overtime_minutes:{
            type:DataTypes.INTEGER,
            defaultValue:0
        },
        status:{
            type:DataTypes.ENUM('present','absent','half_day','leave'),
            defaultValue:'present'
        },
        hours_worked:{
            type:DataTypes.DECIMAL(4,2),
            defaultValue:0
        },
        note:{
            type:DataTypes.STRING,
            allowNull:true
        }

    },
    {
        sequelize,
        modelName:"Attendance",
        tableName:"attendance",
        timestamps:false
    }
)

export default Attendance;