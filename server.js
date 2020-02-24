console.log('Server-side code running');

const express = require('express');
const MongoClient = require('mongodb').MongoClient;
var request = require('request');
const app = express();
const FRC_SEASON = "2019"

// serve files from the public directory
app.use(express.static('public'));

// connect to the db and start the express server
let db;

// Replace the URL below with the URL for your database

MongoClient.connect("mongodb://localhost", (err, client) => {
  if (err) {
    return console.log(err);
  }
  db = client.db("otr-scouting");
  // start the express web server listening on 8080
  app.listen(8081, () => {
    console.log('listening on 8081');
  });
  loadEvents();
  loadSchedules();
});


// serve the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// add a document to the DB collection recording the click event
app.post('/clicked', (req, res) => {
  const click = { clickTime: new Date() };
  console.log(click);

  db.collection('clicks').save(click, (err, result) => {
    if (err) {
      return console.log(err);
    }
    console.log('click added to db');
    res.sendStatus(201);
  });
});

// Handles adding scouting data to the database.
app.get('/:event/:match/:robot/:action/:position', (req, res) => {
  var scoutPoint = {
    pointtime: new Date(),
    event: req.params['event'],
    match: req.params['match'],
    robot: req.params['robot'],
    action: req.params['action'],
    position: req.params['position']
  }
  db.collection(FRC_SEASON).insertOne(scoutPoint, function (err, res) {
    console.log("Inserted: " + scoutPoint);
    res.sendStatus(201);
  });
});

// Handles reading event pages.
app.get('/data/:event/', (req, res) => {

});

app.get('/data', (req, res) => {
  res.sendFile(__dirname + '/public/data.html');
});

app.get('/match', (req, res) => {
  res.sendFile(__dirname + '/public/match.html');
});
// get the click data from the database
app.get('/clicks', (req, res) => {
  db.collection('clicks').find().toArray((err, result) => {
    if (err) return console.log(err);
    res.send(result);
  });
});


function getScoutedPoints(event, callback) {
  var query = { event: event };
  db.collection(FRC_SEASON).find(query).toArray(function (err, result) {
    if (!err)
      callback(result);
  });
}

function loadEvents() {
  teams = [1334, 1374];
  teams.forEach(team => {
    frcapi("events?teamNumber=" + team, (data) => {
      data["Events"].forEach(event => {
        db.collection("events").replaceOne(event, event, { upsert: true }, (err, res) => {
          if (!err) {
            console.log("Updated event: " + event['code']);
          }
        });
      });
    });
  });
}

function frcapi(args, callback) {
  username = "jamiesinn",
    password = "31DA05E9-230F-4542-9EE6-5371962BE301",
    url = "https://frc-api.firstinspires.org/v2.0/" + FRC_SEASON + "/" + args,
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
  request(
    {
      url: url,
      headers: {
        "Authorization": auth,
        "Accept": "application/json"
      }
    },
    function (error, response, body) {
      data = JSON.parse(body);
      callback(data);
    }
  );
}

function loadSchedules() {
  db.collection("events").find().toArray((err, result) => {
    result.forEach(event => {
      frcapi("schedule/" + event['code'] + "?tournamentLevel=qual", (data) => {
        var matches = data['Schedule'];
        matches.forEach(match => {
          match['event'] = event['code'];
          db.collection("matches").replaceOne(match, match, { upsert: true }, (err, res) => { });
        });
      });
    });
  });
}