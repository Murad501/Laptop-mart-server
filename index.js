const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
require("dotenv").config();
const jwt = require('jsonwebtoken');

app.use(express.json())
app.use(cors())

app.get('/', (req, res)=>{
    res.send('data is coming soon')
})

const verifyJWT = (req, res, next)=>{
    const headers = req.headers.authorization
    if(!headers){
        return res.status(401).send({message: 'unauthorized access'})
    }
    const token = headers.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded)=>{
        if(error){
            return res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded = decoded
        next()
    })

}

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@user1.istzhai.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async() => {
    try{
        const usersCollection = client.db('LaptopMart').collection('users')
        const sellersCollection = client.db('LaptopMart').collection('sellers')

        //users
        app.post('/users', async(req, res)=>{
            console.log('from users')
            const user = req.body
            console.log(user)
            const email = user.email
            const query = {email: email}
            const addedUser = await usersCollection.findOne(query)
            if(addedUser){
                console.log('already added')
                return res.send ({acknowledged:true})
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        //sellers
        app.post('/sellers', async(req, res)=>{
            const seller = req.body
            const result = await sellersCollection.insertOne(seller)
            res.send(result)
        })

        //jwt
        app.get('/jwt', async(req, res)=>{
            const email = req.params.email
            const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '7d'})
            res.send({token})
        })
    }
    catch{

    }
}
run().catch(err => console.log(err))

app.listen(port, ()=>{
    console.log('server running on port', port)
})
