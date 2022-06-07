var express = require("express");
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser')
var axios = require('axios');

var Json2csvParser = require('json2csv').Parser;

var app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


app.listen(5100, () => {
    console.log("Server running on port 5100");

});

app.get("/ping", (req, res, next) => {
    res.json("pong");
});

app.get("/api/testReq", (req, res, next) => {
    
    axios.get('https://api.github.com/users/mapbox')
        .then((response) => {
            console.log(response.data);
            res.json(response.data);
        })
});

app.post("/api/testPostReq", async (req, res, next) => {
    
    // console.log(req.headers.authorization? req.headers.authorization : "No header passed");
    // axios.get('https://jsonplaceholder.typicode.com/posts',{
    //     headers:{
    //     'Authorization': `Bearer abcxyz`
    // }})
    //     .then((response) => {
    //         res.json(response.data);
    //     },(error) => {
    //         console.log(error);
    //         res.json(error)
    //     })
    try{
        const response = await axios.get('https://api.twitter.com/2/tweets/search/all?query=Vikram',{
            headers:{
            'Authorization': `Bearer AAAAAAAAAAAAAAAAAAAAAESSdQEAAAAAyX9l8J5wHSOKGHVZxL7SNgmr2dU%3Dw2RS7ujAmaRKknN6IS6SifJXCk7KXNEsHlul1x98mgw5QaQjbf`
            }});
                // res.json(response.data);
                res.json(response.data)
    }
    catch(error){
        console.log(error);
        res.json(error)
    }
});

app.get("/api/testAxiosAllSpread", (req,res, next) => {
    axios.all([
        axios.get('https://api.github.com/users/mapbox'),
        axios.get('https://jsonplaceholder.typicode.com/posts')
    ]).then(axios.spread((obj1, obj2) => {
        console.log(obj1.data)
        console.log(obj2.data)
        const mergeObj = {
            ...obj1.data,
            ...obj2.data
        }
        console.log('mergeObj ----- ')
        console.log(mergeObj);
        res.json("test");
    })).catch(error => {
        console.log('error status: ', error.response.status);
        res.status(error.response.status)
        res.json(error);
    })
})