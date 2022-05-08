const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

// verifyJWT
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
    if (err) return res.status(403).send({ message: "Forbidden access" });
    req.decoded = decoded;
  });
  next();
}

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

    // sort by Qty API and Count total item
    app.get("/sortQty", async (req, res) => {
      const cursor = items.find().sort({ quantity: -1 });
      const result = await cursor.toArray();
      const topItems = result.slice(0, 3);
      const count = await items.estimatedDocumentCount();
      res.send({ count, topItems });
    });

    // item by email
    app.post("/myitems", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.user.email;
      const email = req.body.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = items.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } else res.status(403).send({ message: "Forbidden access" });
    });

    // Add item
    app.post("/addnewitem", async (req, res) => {
      const item = req.body;
      const result = await items.insertOne(item);
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
