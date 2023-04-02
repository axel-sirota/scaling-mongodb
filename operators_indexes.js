// Run container

docker run -d --name mongo mongo

// Populate DB 

docker exec -i mongo sh -c 'mongoimport -d oreilly -c students --type json' < students.json

// Attach container

docker exec -it mongo /bin/bash

// Run shell

mongosh

// Switch DB

use oreilly

// Let's set two indexes to ee how $ operators use those indexes

db.students.createIndex({"student_id": 1})
db.students.createIndex({"age": 1})

// Let's evaluate the following query:

db.students.find({"student_id" : {$ne: 4563}}).explain("executionStats")


// executionSuccess: true,
// nReturned: 3999996,
// executionTimeMillis: 3910,
// totalKeysExamined: 3999997,
// totalDocsExamined: 3999996,

// Basically this was a collection Scan!

// We see in the plan this is because it creates two ranges.
// Let's see $nin

db.students.find({"grade": {$nin: ["A", "B"]}}).explain("executionStats")

// $nin Always goes to COLLSCAN

// What if we do an $or??
db.students.find({$or: [{"age": 15}, {student_id: {$gt: 43673}}]}).explain("executionStats")

// $or is the ONLY operator that can use multiple indexes in the same query!

