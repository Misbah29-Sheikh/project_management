import dotenv from "dotenv";

dotenv.config({
  path: "./.env"
});

const { default: app } = await import("./app.js");
const { default: connectDB } = await import("./db/db_connect.js");



const port = process.env.PORT || 3002;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port http://localhost:${port}`);
    })
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
    process.exit(1)
  })


