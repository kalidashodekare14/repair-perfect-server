const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000



// middleware
app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.2rn0dld.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


// middleware verification



async function run() {
    try {

        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const repairServices = client.db('repairBD').collection('services')
        const collectionPurchase = client.db('PurchaseDB').collection('Purchase')

        app.get('/services', async (req, res) => {
            const service = repairServices.find()
            const result = await service.toArray()
            res.send(result)
        })

        

        app.get('/service_details/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await repairServices.findOne(query)
            res.send(result)
        })

        app.get('/services/:email', async (req, res) => {
            const email = req.params.email
            const query = { providerEmail: email }
            const cursor = repairServices.find(query)
            const result = await cursor.toArray()
            res.send(result)

        })

        app.get('/update_services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await repairServices.findOne(query)
            res.send(result)
        })

        app.put('/update_services/:id', async(req, res) => {
            const id = req.params.id
            const filter = {_id: new ObjectId(id)}
            const options = {upsert: true}
            const servicesManage = req.body
            const update = {
                $set: {
                    ...servicesManage
                }
            }
            const result = await repairServices.updateOne(filter, update, options)
            res.send(result)
        })

        app.delete('/services/:id', async (req, res) => {
            const deleteInfo = req.params.id
            const query = { _id: new ObjectId(deleteInfo) }
            const result = await repairServices.deleteOne(query)
            res.send(result)

        })

        app.get('/purchase', async (req, res) => {
            const purchase = await collectionPurchase.find().toArray()
            res.send(purchase)
        })


        app.get('/purchase/:email', async (req, res) => {
            const email = req.params.email
            const query = { current_user_email: email }
            const cursor = collectionPurchase.find(query)
            const result = await cursor.toArray()
            res.send(result)

        })

        app.post('/services', async (req, res) => {
            const user = req.body
            const result = await repairServices.insertOne(user)
            res.send(result)
        })

        app.post('/purchase', async (req, res) => {
            const purchase = req.body
            const result = await collectionPurchase.insertOne(purchase)
            res.send(result)
        })





        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Repair Perfect server is running')
})

app.listen(port, (req, res) => {
    console.log(`Pepair Perfect servier is running on the ${port}`)
})