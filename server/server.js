import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/configs/db.js";
import app from "./src/app.js";

connectDB();

// For local development, start the HTTP server.
// On Vercel, this file is imported as a serverless function — app is exported below.
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
    );
  });
}

export default app;
