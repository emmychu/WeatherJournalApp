// Setup empty JS object to act as endpoint for all routes
let projectData = {};


// Express to run server and routes
const express = require('express');

// Start up an instance of app
const app = express();

/* Dependencies */
const bodyParser = require('body-parser')

/* Middleware*/
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Here we are configuring express to use body-parser as middle-ware.
// Cors for cross origin allowance
const cors = require('cors');
app.use(cors());

// Initialize the main project folder
app.use(express.static('website'));

const port = 8000;

// Spin up the server

const server = app.listen(port, listening);
function listening(){
    console.log(`running on localhost: ${port}`)
};

// Callback to debug

// Initialize all route with a callback function

app.get('/all', sendData);

// Callback function to complete GET '/all'
function sendData(request,response){
    response.send(projectData);
};


// Post Route

app.post('/add', addData);
let newData = []
function addData(request,response){
    newData.push(request.body)
    let entryDate = newData[0].date
    projectData[entryDate] = newData; 
}


  