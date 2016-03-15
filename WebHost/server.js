/*  Code for lap timer server */

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var bodyParser = require('body-parser');
var serialize = require('node-serialize');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('race.db');

var users = [];

var serialLib = require("serialport");
var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/ttyUSB0", {
  baudrate: 9600,
  parser: serialLib.parsers.readline("\n")
});

var currentRaceId = 0;
var currentRaceName = "New Race";
// get current new Race 
db.serialize(function() { 

    // select all users
    db.each("SELECT * from User", function(err, row) {
      users[row.id] = { id:row.id, name : row.name, details : row.details , team : row.team};
    });

    db.each("SELECT rowid as id , raceEnded from Race ORDER BY rowid desc limit 1", function(err, row) {
        if(row.raceEnded == 0)
        {
            currentRaceId = row.id;
            // update RaceInfo to load previous race details
            db.each("select * from Details where raceId = " + currentRaceId, function(err, row){
                var found = false;
                for (var i = 0; i < raceInfo.length; i++) {
                   if (raceInfo[i].Id == row.id) {
                        raceInfo[i].val.push({lapTime:row.lapTime});
                        found = true;
                    }
                }
                if(!found)
                {
                    var v = {};
                    v.Id = row.id;
                    v.val = [];
                    v.val.push({lapTime:row.lapTime});
                    raceInfo.push(v);
                }
            });
        }
    }, function()
    {
        // If currentRaceId is still zero create a new race;
        if(currentRaceId == 0)
        {
            db.run("INSERT INTO Race VALUES('New Race','',CURRENT_TIMESTAMP,0)", function(){
            // On Complete
                db.each("SELECT rowid as id, name from Race ORDER BY rowid desc limit 1", function(err, row) {
                    currentRaceId = row.id;
                    currentRaceName = row.name;

                    raceInfo = [];
                });
            });
        }

    });
});

// Mock out other users
for(var i=0;i<64;i++)
{
    if(!users[i])
    {
        users[i] = {name:i, details:'',team:''};
    }
}

console.log("Current Race id " + currentRaceId); 

serialPort.on("open", function () {
  console.log('open');

  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
    addRacerLap(data);
    io.emit('raceData', raceInfo);
  });

  serialPort.write(new Buffer('4','ascii'), function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});

app.use('/js', express.static(__dirname + '/js'));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/newrace', function(req, res){
    EndRace(currentRaceId);
    db.run("INSERT INTO Race VALUES('" + req.query.name + "','',CURRENT_TIMESTAMP,0)", function(){
        // On Complete
        db.each("SELECT rowid as id, name from Race ORDER BY rowid desc limit 1", function(err, row) {
            currentRaceId = row.id;
            currentRaceName = row.name;

            raceInfo = [];
            io.emit('raceData', raceInfo);
            //io.emit('speak', {message:'New Race Started'});
            io.emit('speak', "New race started.");

            res.send(currentRaceId);
        });
    });
});

app.get('/test', function(req,res)
    {
        res.sendFile(__dirname + '/test.html');
    });

app.get('/reset', function (req, res) {
    var racersSer = serialize.serialize(racers);

    fs.appendFile('/home/pi/src/webserver/logs.txt', '\n\n', function (err) {
        // if (err) throw err;
        console.log('The "data to append" was appended to file!');
    });

    fs.appendFile('/home/pi/src/webserver/logs.txt', racersSer, function (err) {
        // if (err) throw err;
        console.log('The "data to append" was appended to file!');
    });
    racers = [];
    res.sendFile(__dirname + '/reset.html');
});

app.post('/updateuser', function(req, res) {
    console.log(req.body);
    db.serialize(function() { 
        db.run("UPDATE User SET name='" + req.body.name + "', details='" + req.body.details + "' where id = " + req.body.id);
    });
    users[req.body.id] = {id:req.body.id, name:req.body.name, details:req.body.details, team:req.body.team};
    res.send(users);
});

app.get('/getusers', function(req, res) {
    res.send(users);
});

app.get('/users', function(req, res) {
    res.sendFile(__dirname + '/users.html');
});

var raceOutData = {};

app.get('/history', function(req, res){
    res.sendFile(__dirname + '/history.html');
});

app.get('/race', function(req, res){
    res.sendFile(__dirname + '/race.html');
});

app.get('/historyData2', function(req, res){
    var histData = [];
    db.each("SELECT rowid, name, location, createdDate FROM Race order by rowid DESC", function(err, row) {
        histData.push({id:row.rowid, name:row.name, location:row.location, createdDate:row.createdDate});
        },function(){
            res.send(histData);
        });
});

app.get('/historyData', function(req, res){
    var histData = [];
    
    db.each("SELECT rowid, name, location, createdDate FROM Race order by rowid DESC", function(err, row) {
        histData.push({id:row.rowid, name:row.name, location:row.location, createdDate:row.createdDate, pilots : []});
        },function(){
            db.each("select distinct raceId, pilotId, pilotName, pilotDetails from History", function(err1, row1) {
                // fetch details or each race
                for(var x=0;x<histData.length;x++)
                {
                    if(histData[x].id == row1.raceId)
                    {
                        // Found it
                        histData[x].pilots.push({id:row1.pilotId,name:row1.pilotName});
                    }
                }
            }, function(){
                // Final Complete
                res.send(histData);
            });
            
        });
});

app.get('/racepilots',function(req, res){
    var pilotsRaced = [];
    db.each("SELECT DISTINCT * from History where raceId=" + req.query.id, function(err, row){
            pilotsRaced.push(row);
            }, function(){
                // real completed
                res.send(pilotsRaced);
            });
});


app.get('/raceinfo', function(req, res) {
    
    raceOutData = {};
    raceOutData.id = req.query.id;
    raceOutData.details = [];

    
        db.each("SELECT * from Race where rowid = " + req.query.id, function(err, row) {
            console.log(row.name);
            raceOutData.name = row.name;
        },function(){
            // first complete
            db.each("SELECT * from Details where raceId=" + req.query.id, function(err2, row2) {
                var found = false;
                for(var x=0;x<raceOutData.details.length;x++)
                {
                    if(raceOutData.details[x].Id == row2.id)
                    {
                        found = true;
                        raceOutData.details[x].val.push({lapTime:row2.lapTime});
                    }
                }
                if(!found)
                {
                    var x = {};
                    x.Id = row2.id;
                    x.Name = users[row2.id].name;
                    x.val = [];
                    var y = {};
                    y.lapTime = row2.lapTime;
                    x.val.push(y);
                    raceOutData.details.push(x);
                }
            
            }, function(){
                // final complete
                console.log(raceOutData);
                res.send(raceOutData);
            });

        });    
});


io.on('connection', function (socket) {
    console.log('new connection');
    //io.emit('raceData', raceInfo);
    socket.on('fetch', function (msg) {
        io.emit('raceData', raceInfo);
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

http.listen(80, function () {
    console.log('listening on *:80');
});

var raceInfo = [];

var max_lap_time = 60000;

var addRacerLap = function(line)
{
	var ss = line.split(',');
    if(ss[2] > max_lap_time)
    {
        return;
    }

	var r = ss[1];
	for (var i = 0; i < raceInfo.length; i++) {
	        if (raceInfo[i].Id == r) {
	            var v = {};
	            v.lapTime = ss[2];
	            v.lapStart = ss[3];
	            v.lapEnd = ss[4];
	            raceInfo[i].val.push(v);
                InsertToDB(r, v);
	            return 0;
	        }
	    }

	    var n = raceInfo.length;
	    var x = {};
	    x.Id = r;
        x.Name = users[r].name;
        x.val = [];
	    var y = {};
	    y.lapTime = ss[2];
	    y.lapStart = ss[3];
	    y.lapEnd = ss[4];
	    x.val.push(y);
        InsertToDB(r, y);
	    raceInfo[n] = x;
    return 0;
}

var InsertToDB = function(id, data)
{
    Speak(id, data);
    db.serialize(function() { 
        db.run("INSERT INTO Details VALUES('" +  currentRaceId +  "','" + id + "','" + data.lapTime + "','" +  data.startTime +"','" + data.endTime + "', CURRENT_TIMESTAMP)");
    });
}

var Speak = function(id, data)
{
    //io.emit("speak", { user : users[id].name , value : data.lapTime});
    io.emit("speak", users[id].name + " " + format_time(data.lapTime) + " seconds.");
}

var format_time = function (val) {
    var seconds = Math.floor(val / 1000);
    var dec = Math.floor(val / 100);
    return seconds + "." + dec;
};

var EndRace = function(raceId)
{
    // Here we get current users and update the Race Table
    db.each("select distinct raceId, id from Details where raceId=" + raceId, function(err, row) {
                // fetch details or each race
                db.run("INSERT INTO History VALUES('" + raceId + "','" + row.id +"','" + users[row.id].name + "','" + users[row.id].details + "')");
            }, function(){
                // Final Complete
                db.run("update Race set raceEnded=1 where rowid=" + raceId);
            });
}

// Racer Info
var racers = [];




