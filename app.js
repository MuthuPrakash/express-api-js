var express = require("express");
var bodyParser = require('body-parser')
var axios = require('axios');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const hubspotCodingAssessmentGetEndPoint = "https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=9c6fe3e4286e0ba07146bd1db3ad";  //need to be moved to .env or config
const sessionLimit = 600000; // 10 minutes in milliseconds - need to be moved to .env or config

const errorHandler = (error, request, response, next) => {
    // Error handling middleware functionality
    console.log( `error ${error.message}`) // log the error
    const status = error.status || 400
    // send back an easily understandable error message to the caller
    response.status(status).json(error.message)
  }

app.listen(5100, () => {
    console.log("Server running on port 5100");

});

app.get("/ping", (req, res, next) => {
    res.json("pong");
});

app.post("/api/hubspotCodingAssessment", async (req, res, next) => {
    
    try{
        const response = await axios.get(hubspotCodingAssessmentGetEndPoint);
    
        // Grouping by visitor
        let eventsArray = response.data.events;
        let key = "visitorId";
        let resultGroupByVisitor = eventsArray.reduce((result, currentValue) => {
            let groupKey = currentValue[key];
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(currentValue);
            return result;
        }, {});

        // Sort by time
        
        Object.keys(resultGroupByVisitor).forEach(visitor => {
            resultGroupByVisitor[visitor].sort((a,b) => {
                return a.timestamp - b.timestamp
            });
        });

        //group based on session by 10 min difference

        let outputJson = {"sessionsByUser": {}}
        let pagesCollection = [];
        let timeStampCollection = [];
        
        Object.keys(resultGroupByVisitor).forEach(visitor => {
            outputJson.sessionsByUser[visitor] = [];
            
            for(let i = 0; i < resultGroupByVisitor[visitor].length; i++){
                pagesCollection.push(resultGroupByVisitor[visitor][i]["url"]) 
                timeStampCollection.push(resultGroupByVisitor[visitor][i]["timestamp"]);
                if (!(i+1 < resultGroupByVisitor[visitor].length && resultGroupByVisitor[visitor][i+1]["timestamp"] - resultGroupByVisitor[visitor][i]["timestamp"] < sessionLimit)){
                    outputJson.sessionsByUser[visitor].push({duration: timeStampCollection.length > 1 ? timeStampCollection[timeStampCollection.length-1] - timeStampCollection[0] : 0, pages: pagesCollection, startTime: timeStampCollection[0]} );
                    pagesCollection = [];
                    timeStampCollection = [];
                }
            }
        });
        res.json(outputJson);
    }
    catch(error){
        console.log(error);
        next(error) 
    }
});

app.use(errorHandler)
