const mongoose = require("mongoose");
mongoose
	.connect("mongodb+srv://mertsondas0505_db_user:G5hsQX0wnykfIBFO@cluster0.mhv2xkj.mongodb.net/?appName=Cluster0")
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("MongoDB error", err));
const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

const homeRoute = require("./routes/home");
const apiRoute = require("./routes/api");

app.use(express.static(path.join(__dirname, "public")));

app.use("/", homeRoute);
app.use("/api", apiRoute);

app.listen(3000, () => {
	console.log("Server running on http://localhost:3000");
});
