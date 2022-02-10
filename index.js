const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const port = process.env.PORT || 5001;
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');

app.use(cors());
app.use(express.json());
dotenv.config();

// MongoDB URI...
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vx9y5.mongodb.net/yooda?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// 
async function run() {
    try {
        await client.connect();
        const database = client.db('yooda');
        const foodCollection = database.collection('foods');
        const studentCollection = database.collection('student');
        const distributionCollection = database.collection('distribution');

        // Adding food items...
        app.post('/foods', async(req, res) => {
            const foods = req.body;
            const result = await foodCollection.insertOne(foods);
            res.json(result);
        });

        // Getting food items...
        app.get('/foods', async(req, res) => {
            const cursor = foodCollection.find({});
            const count = await cursor.count();

            const page = req.query.page;
            const size = parseInt(req.query.size);

            let result;
            if (page) {
                result = await cursor
                    .skip(page * size)
                    .limit(size)
                    .toArray();
            } else {
                result = await cursor.toArray();
            }

            res.json({
                result,
                count,
            });
        });

        // Getting single food...
        app.get('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await foodCollection.findOne(query);
            res.json(result);
          });

        //   Editing single food...
          app.put('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const updatedFood = req.body;
      
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
              $set: {
                foodName: updatedFood.fullName,
                foodPrice: updatedFood.foodPrice,
              },
            };
            const result = await foodCollection.updateOne(filter, updateDoc, options);
            res.send(result);
          });

          // Deleting single food...
        app.delete('/food/:id', async (req, res) => {
            const stdId = req.params.id;
            const query = { _id: ObjectId(stdId) };
            const result = await foodCollection.deleteOne(query);
            res.json(result);
        });
        
        // Adding studens...
        app.post('/students', async(req, res) => {
            const students = req.body;
            const result = await studentCollection.insertOne(students);
            res.json(result);
        });

        // Getting students...
        app.get('/students', async(req, res) => {
            const cursor = studentCollection.find({});
            const count = await cursor.count();

            const page = req.query.page;
            const size = parseInt(req.query.size);

            let result;
            if (page) {
                result = await cursor
                    .skip(page * size)
                    .limit(size)
                    .toArray();
            } else {
                result = await cursor.toArray();
            }

            res.json({
                result,
                count,
            });
        });

        // Deleting single studen...
        app.delete('/students/:id', async(req, res) => {
            const stdId = req.params.id;
            const query = { _id: ObjectId(stdId) };
            const result = await studentCollection.deleteOne(query);
            res.json(result);
        });

        // Deleting multiple students...
        app.post('/multi', async(req, res) => {
            const idArray = req.body;

            let result;
            idArray.forEach(async(id) => {
                const query = { _id: ObjectId(id) };
                result = await studentCollection.deleteOne(query);
            });
            res.json(result);
        });

        // Student status change...
        app.post('/status', async(req, res) => {
            const idArray = req.body;
            let result;

            idArray.forEach(async(st) => {
                let newArr = st.split(',');
                const filter = { _id: ObjectId(newArr[0]) };
                const options = { upsert: true };

                let newStat = newArr[1] === 'active' ? 'inActive' : 'active';
                console.log(newStat);

                const updateDoc = {
                    $set: {
                        status: newStat,
                    },
                };
                result = await studentCollection.updateOne(filter, updateDoc, options);
            });
            res.send(result);
        });

        // Getting student...
        app.get('/students/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await studentCollection.findOne(query);
            res.json(result);
        });

        // Edit...
        app.put('/students/:id', async(req, res) => {
            const id = req.params.id;
            const updatedStudent = req.body;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    fullName: updatedStudent.fullName,
                    roll: updatedStudent.roll,
                    age: updatedStudent.age,
                    stclass: updatedStudent.stclass,
                    status: updatedStudent.status,
                },
            };
            const result = await studentCollection.updateOne(
                filter,
                updateDoc,
                options,
            );
            res.send(result);
        });

        // Search distribution...
        app.post('/distribution', async(req, res) => {
            const { id, shift, date } = req.body;
            const query = {
                studentId: id,
                shift: shift,
                date: date,
            };
            const result = await distributionCollection.findOne(query);
            res.json(result);
        });

        // Food adding distribution...
        app.post('/distribution-food', async(req, res) => {
            const serveData = req.body;
            const result = await distributionCollection.insertOne(serveData);
            res.json(result);
        });
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is working perfectly');
});

app.listen(port, () => {
    console.log('Listening to port: ', port);
});