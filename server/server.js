const http = require('http');
const express = require('express');
require('dotenv').config()
calendar = require('./calendar')
const app = express()



app.use(express.json()) // extra 
app.use((req, res, next) => {
    console.log(req.path, res.method)
    next()
})

app.get("/", (req, res)=> {
    res.json({"msg": "hello world"})
})


app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});