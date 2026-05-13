import "dotenv/config";
import app from "./app.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required.");
}

const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  console.log(`Family expense tracker API listening on port ${port}`);
});
