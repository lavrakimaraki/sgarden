import "dotenv/config";

import mongoose from "mongoose";

const init = async () => {
	const {
		DATABASE_URL = "mongodb://localhost:27017/testDB",
	} = process.env;

	mongoose.set("strictQuery", false);
	mongoose.set("bufferCommands", false);
	const connection = await mongoose.connect(DATABASE_URL).catch((error) => {
		console.error("Database connection failed:", error.message);
		return null;
	});
	if (connection) {
		console.log("Connected to db!");
	}

	return connection;
};

export default init;
