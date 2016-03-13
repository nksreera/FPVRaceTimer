/*  Code for lap timer server */

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var serialize = require('node-serialize');
var fs = require('fs');

var serialLib = require("serialport");
var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/ttyUSB0", {
  baudrate: 9600,
  parser: serialLib.parsers.readline("\n")
});

serialPort.on("open", function () {
  console.log('open');

  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
    addRacerLap(data);
    console.log(raceInfo);
  });

  serialPort.write(new Buffer('4','ascii'), function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});

app.use('/js', express.static(__dirname + '/js'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
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


io.on('connection', function (socket) {
    // console.log('new connection');
    io.emit('raceData', racers);
    socket.on('fetch', function (msg) {
        io.emit('raceData', racers);
    });

    // emit all current laps

    for (var i = 0; i < racers.length; i++) {
        for (var j = 1; j < racers[i].val.length; j++) {
            var laplength = racers[i].val[j] - racers[i].val[j - 1];
            // io.emit('racer1', format_time(laplength));
        }
    }
});

http.listen(80, function () {
    console.log('listening on *:80');
});

var raceInfo = [];

var addRacerLap(line)
{
	var ss = line.split(',');
	var r = ss[1];
	for (var i = 0; i < raceInfo.length; i++) {
	        if (raceInfo[i].Id == r) {
	            var v = {};
	            v.lapTime = ss[2];
	            v.lapStart = ss[3];
	            v.lapEnd = ss[4];
	            raceInfo[i].val.push(v);
	            return 0;
	        }
	    }

	    var n = raceInfo.length;
	    var x = {};
	    x.Id = r;
	    x.val = [];
	    var y = {};
	    y.laptime = ss[2];
	    y.lapStart = ss[3];
	    y.lapEnd = ss[4];
	    x.val.push(y);
	    raceInfo[n] = x;
    return 0;
}

// Racer Info
var racers = [];

// Constants
var min_lap_millis = 5000;
var decode_bit_length = 7;  // decode bit length + header space

var addTime = function (r, v) {
    // r -> racer id
    // v -> time in millis
    for (var i = 0; i < racers.length; i++) {
        if (racers[i].Id == r) {
            var diff = v - racers[i].val[racers[i].val.length - 1];
            if (diff > min_lap_millis) {
                var laplength = v - racers[i].val[racers[i].val.length - 1];
                racers[i].val.push(v);
                return laplength;
            }
            return 0;
        }
    }

    var n = racers.length;
    var x = {};
    x.Id = r;
    x.val = [];
    x.val.push(v);
    racers[n] = x;
    return 0;
};

var format_time = function (val) {
    var seconds = Math.floor(val / 1000);
    var dec = Math.floor(val / 100);
    return seconds + ":" + dec;
};


var add_sensor_data = function(sensor_id, dur) {
    if(dur > 500)
    {
        new_pulse[sensor_id].push(1);
    }
    else
    {
        new_pulse[sensor_id].push(0);
    }
    console.log(dur);

    if(new_pulse[sensor_id].length >= 8)
    {
        // try a decode here
        var data = decode(new_pulse[sensor_id]);
        console.log('decoded ' + data);

         /*if (data != 0) {
                // understandable pulse
                var laplength = addTime(data, micros / 1000);
                if (laplength > 0) {
                    io.emit('raceData', racers);
                }
            }*/
        // clear
        new_pulse[sensor_id] = [];
    }
};


