var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('race.db');
//var db = new sqlite3.Database(':memory:'); 

db.serialize(function() {
  //db.run("CREATE TABLE Race (name TEXT, location TEXT, createdDate DATE)");
  //db.run("CREATE TABLE Details(raceId INT, id INT, lapTime BIGINT, startTime BIGINT, endTime BIGINT, createdDate DATE)");
  //db.run("CREATE TABLE User(id INT, name TEXT, details TEXT, team TEXT)");
  //db.run("CREATE TABLE Admin(username TEXT, password TEXT)");

 //db.run("INSERT INTO Race VALUES('Test2','test2', date('now'))");
 
  
  //for (var i = 1; i < 64; i++) {
  //    db.run("INSERT INTO User VALUES('" + i + "','" + i + "','','')");
  //}
  // stmt.finalize();

  // db.run("INSERT INTO User VALUES('13','Kishore','Quad','')");
 
  //db.each("SELECT rowid AS id, name, createdDate FROM Race", function(err, row) {
  //    console.log(row.id + ": " + row.name + " -- " + row.createdDate);
  //});

  db.run("UPDATE User SET name='Tester', details='Quad' where id=13");

});
 
db.close();
