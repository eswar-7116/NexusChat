import mongoose from 'mongoose';

export default async function connectDB() {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log("DB already connected!");
            return;
        }

        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to the DB!");
    } catch (err) {
        console.log("Unable to connect to DB: " + err.message);
        process.exit(1);
    }
}