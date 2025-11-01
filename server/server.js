const app = require("./app");
const { configDotenv } = require("dotenv");

configDotenv({quiet: true});

const connectDB = require("./config/database/db");

connectDB();
const PORT = process.env.PORT;


if (!PORT) {
    throw new Error("PORT is not defined in environment variables");
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

