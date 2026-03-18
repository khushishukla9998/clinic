const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const config = require("../clinic/config/dev.json");
const appStrings = require("../clinic/src/components/utils/appString")
const adminIndex = require("../clinic/src/components/admin/index")
// const userIndex = require("../clinic/src/components/user/index")
const http = require("http")
const app = express();
const port = config.PORT
// const { initSocket, sendNotificationToUser } = require("./src/components/user/controller/socketController");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "components", "user", "views"));

// const server = http.createServer(app);
// initSocket(server);

console.log("======== SERVER FILE LOADED=========");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use("/api/admin", adminIndex);
// app.use("/api/user", userIndex);

const connectDb = async () => {
  try {
    await mongoose.connect(config.MONGO_DB_URL);
    console.log(appStrings.DATABASE_CONNECT);
  } catch (err) {
    console.log(err.message);
  }
};

async function startServer() {
  try {
    app.listen(port, () => {
      console.log(appStrings.SERVER_RUNNING + ` ${port}`);
    });
  } catch (err) {
    console.log(err.message, appStrings.SERVER_ERROR);
  }
}

startServer();
connectDb();