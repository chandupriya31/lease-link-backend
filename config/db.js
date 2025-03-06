import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('connected to db')
    } catch (err) {
        console.log('Error connecting to db', err)
    }
}

export default connectDB