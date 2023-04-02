// Run container

docker run -d --name mongo mongo

// Attach container

docker exec -it mongo /bin/bash

// Create data directories since the main mongod is using /data/db

mkdir -p /tmp/db{1,2,3}

// Run mongod processes for RS
nohup mongod --replSet nextSteps --port 27000 --dbpath /tmp/db1 --oplogSize 200  &>/dev/null &
nohup mongod --replSet nextSteps --port 27001 --dbpath /tmp/db2 --oplogSize 200  &>/dev/null &
nohup mongod --replSet nextSteps --port 27002 --dbpath /tmp/db3 --oplogSize 200  &>/dev/null &

// Connect to a mongod process via a shell
  mongosh --port 27000

// Inside the shell
rsconf = {
    _id: "nextSteps",
    members: [
      {_id: 0, host: "localhost:27000"},
      {_id: 1, host: "localhost:27001"},
      {_id: 2, host: "localhost:27002"} 
    ]
  }
rs.initiate(rsconf)
db.isMaster()
rs.status()

use oreilly

for (i=0; i<200; i++) {db.testing.insert({_id: i})}

db.testing.findOne()

// Go to a secondary, let's say (is random sop choose your own) 27002

secondaryConn = new Mongo("localhost:27002")
secondaryDB = secondaryConn.getDB("oreilly")
secondaryDB.testing.find() //errors

secondaryConn.setReadPref("primaryPreferred")

secondaryDB.testing.find() // success

secondaryDB.testing.insert({"_id" : 201}) // not master!

db.adminCommand({"shutdown" : 1})

secondaryDB.isMaster() // primary changed!!

exit

nohup mongod --replSet nextSteps --port 27000 --dbpath /tmp/db1 --oplogSize 200  &>/dev/null &

monosh --port 27001

rs.status()  // It rejoined the RS!

