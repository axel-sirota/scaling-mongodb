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

// Let's set two indexes to understand how MongoDB select indexes

db.students.createIndex({"age": 1})
db.students.createIndex({"student_id" : 1, "age": 1})

// Let's evaluate the following query:

db.students.find({"student_id" : {$gt: 500000}, "age": 15}).sort({"student_id": 1}).explain("executionStats")

// This query has the pecualiruty that the find statement points to one index and the sort to the other. 
// So this is a matter of MongoDB knowing if one index "filters enough"

//Let's see the other index, as it is more selective in the query it will perform better

db.students.find({"student_id" : {$gt: 500000}, "age": 15}).sort({"student_id": 1}).hint("age_1").explain("executionStats")

// Indeed, nreturned is closer to Keys and docs examined, meaning it is a better plan. How about we create such an index?

db.students.createIndex({"age": 1, "student_id" : 1})

// Rerunnning the query

db.students.find({"student_id" : {$gt: 500000}, "age": 15}).sort({"student_id": 1}).explain("executionStats")

// executionSuccess: true,
// nReturned: 333475,
// executionTimeMillis: 372,
// totalKeysExamined: 333475,
// totalDocsExamined: 333475,

// WAY better, because we could filter by age on the find()!

// Finally, for the heavy queries of our App we want them covered, let's run this

db.students.find({"student_id" : {$gt: 500000}, "age": 15}, {"_id": 0, "student_id":1, "age": 1}).sort({"student_id": 1}).explain("executionStats")

// Notice the PROJECTION_COVERED in the plan!  
// totalDocsExamined: 0!!