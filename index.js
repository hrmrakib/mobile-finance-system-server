const express = require("express");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dmwxvyo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });

    // database name
    const database = client.db("mobileFinanceSystem");
    // collections
    const userCollection = database.collection("users");

    // register a user
    app.post("/register", async (req, res) => {
      const { name, pin, mobileNumber, email } = req.body;

      console.log(name, pin, mobileNumber, email);
      const existEmail = await userCollection.findOne({ email });
      const existMobileNumber = await userCollection.findOne({ mobileNumber });

      if (existEmail || existMobileNumber) {
        return res.send("Exist the user!");
      }

      const hashedPin = await bcrypt.hash(pin, 10);

      const newUser = {
        name,
        pin: hashedPin,
        mobileNumber,
        email,
        rule: "user",
        status: "pending",
        balance: 0,
      };

      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // get all pending users
    app.get("/pending-users", async (req, res) => {
      const query = { status: "pending" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    // login a user
    app.get("/login", async (req, res) => {
      const { pin, identifier } = req.body;

      const user = await userCollection.findOne({
        $or: [{ email: identifier }, { mobileNumber: identifier }],
      });

      if (!user) {
        console.log("invalid");
        return res.send({ message: "Invalid credientials" });
      }
    });

    // pending user to a user
    app.patch("/make-user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const makeUser = {
        $set: {
          status: "approved",
          balance: 40,
        },
      };

      const result = await userCollection.updateOne(filter, makeUser);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Server is ONNNNNNNN!");
});
