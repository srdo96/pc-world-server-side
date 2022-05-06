const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
// const { get } = require("express/lib/response");
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

    //Auth JWT
    app.post("/signin", async (req, res) => {
      const user = req.body;
      const token = jwt.sign({ user }, process.env.PRIVATE_KEY, {
        expiresIn: "20d",
      });
      res.send({ token });
    });

    // GET all items
    app.get("/items", async (req, res) => {
      const query = {};
      const cursor = items.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET specific item using params
    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const item = await items.findOne(query);
      res.send(item);
    });

    //GET item by email
    app.post("/myitems", async (req, res) => {
      const email = req.body;
      console.log("my mail:", email);
      const query = email;
      console.log(query);
      const cursor = items.find(query);

      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });

    // Update quantity
    app.put("/item/:id", async (req, res) => {
      const id = req.params.id;
      const qty = req.body;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const update = {
        $set: {
          quantity: qty.quantity,
        },
      };
      const result = await items.updateOne(filter, update, option);
      res.send(result);
    });

    // Add item
    app.post("/addnewitem", async (req, res) => {
      const item = req.body;
      const result = await items.insertOne(item);
      console.log(result);
      res.send(result);
    });

    //Delete item
    app.delete("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await items.deleteOne(query);
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
