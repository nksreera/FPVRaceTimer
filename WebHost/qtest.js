var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('race.db');
//var db = new sqlite3.Database(':memory:'); 

db.serialize(function() {
  // db.run("CREATE TABLE Race (name TEXT, location TEXT, createdDate DATE)");
  // db.run("CREATE TABLE Details(raceId INT, id INT, lapTime BIGINT, startTime BIGINT, endTime BIGINT, createdDate DATE)");
  // db.run("CREATE TABLE User(id INT, name TEXT, details TEXT, team TEXT)");
  // db.run("CREATE TABLE Admin(username TEXT, password TEXT)");

 // db.run("INSERT INTO Race VALUES('Test2','test2', date('now'))");
 
  //var stmt = db.prepare("INSERT INTO Race VALUES (?, date('now'))");
  //for (var i = 0; i < 10; i++) {
  //    stmt.run("Ipsum " + i);
  //}
  //stmt.finalize();
 
  //db.each("SELECT * FROM Details", function(err, row) {
  //    console.log(row.raceId + " : " + row.id + " -- " + row.lapTime);
  //});
//db.run("DELETE from User");

/*db.each("SELECT * FROM User", function(err, row) {
      console.log(row.id + " : " + row.name );
  });
*/

/*
db.each("SELECT * FROM Details", function(err, row) {
      console.log(row.id + " : " + row.raceId );
  });


db.each("SELECT rowid as id, name FROM Race", function(err, row) {
      console.log(row.id + " : " + row.name );
  });*/



});



/*
var req = {};
req.query = {};
req.query.id = 30;
var raceOutData = {};
    raceOutData.id = req.query.id;
    raceOutData.details = [];
    raceOutData.last = {};

    // var raceRow = wait.forMethod(db, "each", "SELECT * from Race where rowid = " + req.query.id + " ORDER BY rowid desc limit 1");
    // console.log("Race Row");
    // console.log(raceRow);

    
        db.each("SELECT * from Race where rowid = " + req.query.id + " ORDER BY rowid desc limit 1", function(err, row) {
            
            raceOutData.name = row.name;
            

        }, function(){
          db.each("SELECT * from Details where raceId=" + req.query.id, function(err1, row1) {
                // console.log(row);
                raceOutData.details.push({id:row1.id, laptime:row1.lapTime});
            }, function(){
              // final complete
              console.log(raceOutData);
            });
        });

        

        // select all users
        

        
     */   
    
    //console.log(raceOutData);

/*
var histData = [];

var histData = [];
    db.each("SELECT rowid, name, location, createdDate FROM Race order by rowid DESC", function(err, row) {
        // histData.push({id:row.rowid, name:row.name, location:row.location, createdDate:row.createdDate});
        histData[row.rowid] = {id:row.rowid, name:row.name, location:row.location, createdDate:row.createdDate};
        db.all("SELECT DISTINCT id from Details where raceId=" + row.rowid, function(err1, rows){
          histData[row.rowid].pilots = rows;
          console.log(histData[row.rowid]);
        });
        },function(){
            // console.log(histData);
        });
//db.each("SELECT DISTINCT id from Details where raceId=30", function(err, row){
  //console.log(row);
*/

var currentRaceId = 0;
db.run("INSERT INTO Race VALUES('new stuff','',date('now'))", function() {
  db.each("SELECT rowid as id, name from Race ORDER BY rowid desc limit 1", function(err, row) {
            currentRaceId = row.id;
            console.log(row.name );
        });
});
 
db.close();
