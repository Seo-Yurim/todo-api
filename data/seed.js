import mongoose from 'mongoose';
import data from './mock.js';
import Task from '../models/Task.js';
import * as dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.DATABASE_URL); // open

await Task.deleteMany({}); // 데이터 다 지움
await Task.insertMany(data); // 데이터 다 넣음

mongoose.connection.close(); // close
