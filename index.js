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

// const verifyJWT = (req, res, next)=>{
//     const headers = req.headers.authorization
//     if(!headers){
//         return res.status(401).send({message: 'unauthorized access'})
//     }
//     const token = headers.split(' ')[1]
//     jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded)=>{
//         if(error){
//             return res.status(401).send({message: 'unauthorized access'})
//         }
//         req.decoded = decoded
//         next()
//     })

// }

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@user1.istzhai.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async() => {
    try{
        const usersCollection = client.db('LaptopMart').collection('users')
        const productsCollection = client.db('LaptopMart').collection('products')
        const categoriesCollection = client.db('LaptopMart').collection('categories')
        const bookingProductCollection = client.db('LaptopMart').collection('bookingProduct')

        //users
        app.post('/users', async(req, res)=>{
            const user = req.body
            const email = user.email
            const query = {email: email}
            const addedUser = await usersCollection.findOne(query)
            if(addedUser){
                return res.send ({acknowledged:true})
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        //sellers
        app.get('/sellers', async(req, res)=> {
            const query = {role: 'seller'}
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })

        app.delete('/seller/:id', async(req, res)=> {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })

        app.patch('/seller/:id', async(req, res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const updateDoc = {
                $set: {verified: true}
            }
            const result = await usersCollection.updateOne(query, updateDoc)
            res.send(result)
        })

        app.get('/seller/:email', async(req, res)=>{
            const email = req.params.email
            const query = {email: email}
            const user = await usersCollection.findOne(query)
            res.send({isSeller: user.role === 'seller'})
        })

        //buyers
        app.get('/buyers', async(req, res)=>{
            const query = {role: 'buyer'}
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })

        app.delete('/buyer/:id', async(req, res)=> {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/buyer/:email', async(req, res)=>{
            const email = req.params.email
            const query = {email: email}
            const user = await usersCollection.findOne(query)
            res.send({isBuyer: user.role === 'buyer'})
        })

        //admin
        app.get('/admin/:email', async(req, res)=>{
            const email = req.params.email
            const query = {email: email}
            const user = await usersCollection.findOne(query)
            res.send({isAdmin: user.role === 'admin'})
        })

        //check seller verify
        app.get('/sellerVerify', async(req, res)=>{
            const email = req.query.email
            const query = {email: email}
            const user = await usersCollection.findOne(query)
            if(user.verified){
                return res.send({verified: true})
            }
            res.send({verified: false})
        })

        //categories
        app.get('/categories', async(req, res)=> {
            const query = {}
            const result = await categoriesCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/category/:name', async(req, res)=> {
            const name = req.params.name
            const query = {category: name}
            const result = await productsCollection.find(query).toArray()
            res.send(result)
        })

        //products
        app.get('/products', async(req, res)=>{
            const query = {}
            const result = await productsCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/products', async(req, res)=>{
            const product = req.body
            const result = await productsCollection.insertOne(product)
            res.send(result) 
        })

        //advertised products
        app.get('/advertised', async(req, res)=>{
            const query = {
                advertised: true,
                available: true
            }
            const result = await productsCollection.find(query).toArray()
            res.send(result)
        })

        //product
        app.patch('/product/:id', async(req, res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const updateDoc = {
                $set: {advertised: true}
            }
            const result = await productsCollection.updateOne(query, updateDoc)
            res.send(result)
        })

        app.delete('/product/:id', async(req, res)=> {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })

        //bookingProduct
        app.post('/bookingproduct', async(req, res)=> {
            const product = req.body
            const result = await bookingProductCollection.insertOne(product)
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
