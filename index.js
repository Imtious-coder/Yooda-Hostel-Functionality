const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');

app.use(cors());
app.use(express.json());
dotenv.config();

// Mongo Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@sandbox.5jrgy.mongodb.net/yooda?retryWrites=true&w=majority`;
// const uri = "mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vx9y5.mongodb.net/yooda?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// All async function
async function run() {
    try {
        await client.connect();
        const database = client.db('yooda');
        const foodCollection = database.collection('foodItem');
        const studentCollection = database.collection('student');
        const distributionCollection = database.collection('distribution');

        // Save food to mongo
        app.post('/foods', async(req, res) => {
            const foods = req.body;
            const result = await foodCollection.insertOne(foods);
            res.json(result);
        });

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello From Niche Server!');
});

app.listen(port, () => {
    console.log('Listening to port: ', port);
});