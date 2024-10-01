const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/redisClient");
const { router: authRouter } = require("./routes/auth");
const gameRouter = require("./routes/game");

var bodyParser = require("body-parser");

dotenv.config();
connectDB();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/game", gameRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
