const mongoose = require("mongoose");
const Book = require("./models/Book");
require("dotenv").config();

const books = [
    // 4 base books
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
    { title: "To Kill a Mockingbird", author: "Harper Lee" },
    { title: "1984", author: "George Orwell" },
    { title: "Pride and Prejudice", author: "Jane Austen" },
    // 5 additional books
    { title: "The Catcher in the Rye", author: "J.D. Salinger" },
    { title: "The Hobbit", author: "J.R.R. Tolkien" },
    { title: "Fahrenheit 451", author: "Ray Bradbury" },
    { title: "Brave New World", author: "Aldous Huxley" },
    { title: "Moby Dick", author: "Herman Melville" }
];

mongoose
    .connect("mongodb+srv://mertsondas0505_db_user:G5hsQX0wnykfIBFO@cluster0.mhv2xkj.mongodb.net/?appName=Cluster0")
    .then(async () => {
        console.log("MongoDB connected for seeding");
        try {
            await Book.deleteMany({}); // Optional: clear existing books
            await Book.insertMany(books);
            console.log("Database seeded successfully");
        } catch (err) {
            console.error("Error seeding database:", err);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch((err) => console.error("MongoDB connection error:", err));
