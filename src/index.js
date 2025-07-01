import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import DBConnection from "./db/index.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

// Connect DB and start server
DBConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`❌ Server failed to start: ${error.message}`);
    process.exit(1);
  });



