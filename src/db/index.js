import mongoose from 'mongoose';
import { Database } from '../contents.js';


const dbconnect = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}${Database}`)
        ('Database connected successfully');
    } catch (error) {
        ('Database connection failed');
    }
}

export default dbconnect;