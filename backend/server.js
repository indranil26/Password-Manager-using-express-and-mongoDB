const express = require('express')
const dotenv = require('dotenv')
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser=require('body-parser')
const cors=require('cors')
const {auth}=require('express-oauth2-jwt-bearer')
const { encrypt, decrypt }=require('./encryption.js')

dotenv.config()

const url = process.env.MONGO_URI;
const client = new MongoClient(url);

const dbName = 'passop';
const app = express()
const port = process.env.PORT || 3000
app.use(bodyParser.json())
app.use(cors())

    const authCheck=auth({
        audience: `${process.env.AUTH0_AUDIENCE}`,
        issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
        tokenSigningAlg: 'RS256',        
        }) 
   
app.use(authCheck)
    
client.connect();

const validateSite = (site) => {
    // Adjust the regex based on your requirements
    const siteRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Example for valid domains
    return siteRegex.test(site);
  };
  
  const validateUsername = (username) => {
    // Example: allow alphanumeric characters and underscores, minimum 3 characters
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/; 
    return usernameRegex.test(username);
  };
  
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_\-+={}[\]|\\;:"'<>,./?])[A-Za-z\d~`!@#$%^&*()_\-+={}[\]|\\;:"'<>,./?]{8,}$/;
    return passwordRegex.test(password);
  };

  const validatePasswordInput = (req, res, next) => {
    const { site, username, password } = req.body;
  
    // Check if site is valid
    if (!validateSite(site)) {
      return res.status(400).json({ success: false, error: 'Invalid site format' });
    }
  
    // Check if username is valid
    if (!validateUsername(username)) {
      return res.status(400).json({ success: false, error: 'Invalid username format' });
    }
  
    // Check if password is valid
    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, error: 'Invalid password format. Must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.' });
    }
  
    // If all validations pass, proceed to the next middleware
    next();
  };


app.get('/passwords', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const userId=req.auth.payload.sub
    const encryptedUserId=encrypt(userId)
    const findResult = await collection.find({user_id:encryptedUserId}).toArray();
    const decryptedPassowrd=findResult.map(record=>({
        ...record,
        password: record.password ? decrypt(record.password) : null,
    }))
    res.json(decryptedPassowrd)
})

app.post('/passwords', validatePasswordInput ,async (req, res) => {
    const encryptedPassword=encrypt(req.body.password)
    const encryptedUserId=encrypt(req.auth.payload.sub)
    const password={...req.body, password:encryptedPassword, user_id: encryptedUserId}
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const findResult = await collection.insertOne(password);
    res.send({success:true, result: findResult})
})

app.put('/passwords', validatePasswordInput ,async (req, res) => {
    const { id, site, username, password } = req.body;
    const encryptedPassword=encrypt(password)
    const encryptedUserId=encrypt(req.auth.payload.sub)
    const db = client.db(dbName);
    const collection = db.collection('passwords');

    try {
        const findResult = await collection.updateOne(
            { id: id, user_id: encryptedUserId },  // Match by UUID
            { $set: { site, username, password:encryptedPassword } }
        );
        res.send({ success: true, result: findResult });
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
});

app.delete('/passwords', async (req, res) => {
    const {id}=req.body
    const encryptedUserId=encrypt(req.auth.payload.sub)
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const findResult = await collection.deleteOne({id: id, user_id: encryptedUserId});
    res.send({success:true, result: findResult})
})

app.listen(port, () => {
    console.log(`Example app listening on port https://localhost:${port}`)
})