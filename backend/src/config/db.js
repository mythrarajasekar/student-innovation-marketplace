const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        try {
            await mongoose.connection.db.collection("interests").dropIndex("project_1_user_1");
        } catch (indexError) {
            if (!String(indexError?.message || "").includes("index not found")) {
                console.warn("⚠️ Could not drop legacy interests index:", indexError.message);
            }
        }

        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:");
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDB;