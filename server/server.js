import dotenv from 'dotenv';
dotenv.config();

import connectDB from './src/configs/db.js';
import app from './src/app.js';

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

/*
FILE: server.js
ROLE: Application entry point. Bootstraps the server by loading environment variables, connecting to the database, and starting the HTTP listener.

FUNCTIONS / LOGIC:
  - (top-level) dotenv.config() — loads all variables from .env into process.env before any other module runs.
  - (top-level) connectDB() — initiates the MongoDB connection via mongoose; if it fails the process exits.
  - (top-level) app.listen(PORT) — binds the Express app to the configured PORT (default 5000) and logs the running environment.

IMPORTED BY:
  - Not imported by any other file; this is the root file that Node.js executes directly (e.g. `node server.js` or `npm run dev`).
*/
