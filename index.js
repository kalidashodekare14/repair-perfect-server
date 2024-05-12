const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000



// middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())





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

const logged = (req, res, next) => {
    const token = req.cookies.token
    console.log('check logged', token)

    next()
}

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token
    if (!token) {
        return res.status(401).send({ message: 'unauthorize access' })
    }
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorize access' })
        }
        req.user = decoded
        next()
    })

}



// cookies options
const cookiesOpiton = {
    httpOnly: true,
    secure: false
    // secure: process.env.NODE_ENV === 'production' ? true : false,
    // sameSite: process.env.NODE_ENV = 'production' ? 'none' : 'strict',
}

async function run() {
    try {

        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const repairServices = client.db('repairBD').collection('services')
        const collectionPurchase = client.db('PurchaseDB').collection('Purchase')


        app.post('/jwt', logged, async (req, res) => {
            const user = req.body
            console.log(user)
            const token = jwt.sign(user, process.env.SECRET, { expiresIn: '1d' })
            res.cookie('token', token, cookiesOpiton)
                .send({ success: true })

        })

        app.post('/logout', (req, res) => {
            const user = req.body
            console.log('loggout', user)
            res.clearCookie('token', { ...cookiesOpiton, maxAge: 0 }).send({ success: true })
        })

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

        app.get('/services/:email', logged, verifyToken, async (req, res) => {
            if (req.user?.email !== req.params.email) {
                return res.status(403).send({ messsage: 'forbidden access' })
            }
            console.log('tok tok token', req.cookies)
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

        app.put('/update_services/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
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

        app.get('/purchase', logged, verifyToken, async (req, res) => {
            const purchase = await collectionPurchase.find().toArray()
            res.send(purchase)
        })

        app.get('/service_to_do', async (req, res) => {
            const toDo = await collectionPurchase.find().toArray()
            res.send(toDo)
        })


        app.get('/purchase/:email', logged, verifyToken, async (req, res) => {
            if (req.user?.email !== req.params.email) {
                return res.status(403).send({ messsage: 'forbidden access' })
            }
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

        app.patch('/purchase/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const serviceStatus = req.body
            console.log(req.body)
            const statusUpdate = {
                $set: { ...serviceStatus }
            }
            const result = await collectionPurchase.updateOne(query, statusUpdate)
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