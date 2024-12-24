import dotenv from "dotenv";
import dbconnect from "./db/index.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

dbconnect()
    .then(() => {
        console.log("Database connected successfully");
    })
    .then(() => {

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    });
