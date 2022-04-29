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

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h2ajj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const items = client.db("pc-world").collection("item");

    // GET all items
    app.get("/items", async (req, res) => {
      const query = {};
      const cursor = items.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Listening to port ->", port);
});
