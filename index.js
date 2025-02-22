import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());

import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.haw69.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const db = client.db("TaskManageMent");
    const usersCollection = db.collection("users");
    const taskCollection = db.collection("tasks");

    app.post("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };

      // check if user exists in db
      const isExist = await usersCollection.findOne(query);
      if (isExist) {
        return res.send(isExist);
      }
      const result = await usersCollection.insertOne({
        email,
        timestamp: Date.now(),
      });
      res.send(result);
    });

    app.post("/api/tasks", async (req, res) => {
      const { title, description, category, email } = req.body;
      const newTask = {
        title,
        description,
        category,
        email,
        timestamp: new Date(),
      };
      const result = await taskCollection.insertOne(newTask);
      res.send(result);
    });

    app.get("/api/tasks/:email", async (req, res) => {
      const email = req.params.email;

      const querry = { email };
      const result = await taskCollection.find(querry).toArray();
      res.send(result);
    });
    app.put("/api/tasks/:id", async (req, res) => {
      const { id } = req.params;
     
      try {
        const result = await taskCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { category: req.body.category } } 
        );
        if (result.modifiedCount > 0) {
          res.status(200).send(result);
        } else {
          res.status(404).send({ message: "Task not found or not updated" });
        }
      } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
