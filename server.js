import express from 'express';
import {readdirSync} from 'fs';
import cors from 'cors';
import mongoose from 'mongoose';
const  morgan =  require('morgan');

require('dotenv').config();

const app = express();

//db connection
mongoose.connect(process.env.DATABASE,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(()=>console.log('DB Connected'))
.catch((err)=>console.log("DB Connection Error",err))

//route middleware
app.use(cors());
app.use(morgan('dev'));

//read all routes without importing them one by one
readdirSync('./routes').map((r)=>app.use('/api',require(`./routes/${r}`)));
  



const PORT = process.env.PORT || 8000
app.listen(8000,()=>console.log(`Server is running on port ${PORT}`));