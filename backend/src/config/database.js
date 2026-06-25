import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host:process.env.DB_HOST,
        port:process.env.DB_PORT,
        dialect:'mysql',
        logging:process.env.NODE_ENV == 'development' ? console.log : false ,//development time queries and on production hide it 
        pool:{
            max:10,
            min:0,
            acquire:30000,
            idle:1000
        }
    }
);


const connectDB = async () =>{
    try{
        await sequelize.authenticate();
        console.log('MYSQL is connected')

    }catch(error){
        console.error('Database connection fail:',error.message);
        process.exit(1) // if DB not connected server end
    }
}

export {sequelize,connectDB}