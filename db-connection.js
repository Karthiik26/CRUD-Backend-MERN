const mongoose = require("mongoose");
require("dotenv").config();
// mongoose.connect("mongodb://127.0.0.1:27017/CRUDOPERATIONS");
mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;

db.on("error", (error) => {
  console.log("Mongo Connection Error - " + error);
});

db.on("open", () => {
  console.log("MongoDB Connected Succesfully");
});

db.on("disconnected", () => {
  console.log("MongoDb Disconnected");
});

process.on("SIGINT", () => {
  db.on(() => {
    console.log("Mongodb connection Closed Through the Cmd - nodemon");
    process.exit(0);
  });
});
