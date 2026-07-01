import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import {connectDB , sequelize} from './config/database.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(helmet()); //security 
app.use(morgan('dev')); //logging
app.use(cors({
    origin:'http://localhost:3000' || process.env.FRONTEND_URL,
    credentials:true
}))


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.use('/api/v1/auth',authRoutes);

//Health check
app.get("/health", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

//404 error handler
app.use((req,res)=>{
    res.status(400).json({
        sucess:false,
        message:'Endpoint not found'
    })
});

// global error handler
app.use((err,req,res,next)=>{
    console.log(err.stack);

    res.status(500).json({
        success:false,
        message:'Server error'

    })
});

const PORT = process.env.PORT || 5000;

const startServer = async () =>{
    try{
        await connectDB();

        //table sync
        await sequelize.sync({alter:true});
        console.log("Database now synced")

        // server start
        app.listen(PORT,()=>{
            console.log(`server started at : http://localhost:${PORT}`)
        });
    }
    catch(error){
        console.log("server did'nt start " , error);
        process.exit(1);
    }
}

startServer();

