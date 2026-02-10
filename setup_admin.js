const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = "mongodb+srv://mertsondas0505_db_user:G5hsQX0wnykfIBFO@cluster0.mhv2xkj.mongodb.net/?appName=Cluster0";

async function createAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        const adminUser = {
            username: "admin",
            password: "adminpassword123", // You should change this!
            role: "admin"
        };

        const existingAdmin = await User.findOne({ username: adminUser.username });
        if (existingAdmin) {
            console.log("Admin user already exists!");
        } else {
            const user = await User.create(adminUser);
            console.log("Admin user created successfully!");
            console.log("Username:", user.username);
            console.log("Password:", adminUser.password);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error creating admin:", error);
    }
}

createAdmin();
