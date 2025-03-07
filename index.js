import dotenv from "dotenv";
import app from "./routes.js";
import connectDB from "./config/db.js";

dotenv.config({ path: "./.env" });

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running`);
    });
  })
  .catch((err) => {
    console.log(`Unable to connect mongoDB server.... ${err}`);
  });
