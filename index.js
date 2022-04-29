const { MongoClient } = require("mongodb");
const cors = require("cors");
const express = require("express");
const { get } = require("express/lib/response");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("WelCome to Pc World Server");
});

app.listen(port, () => {
  console.log("Listening to port ->", port);
});
