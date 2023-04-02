// Start config server

docker-compose up -d

docker exec -it mongocfg1 /bin/bash

mongosh

// Inside the shell
rsconf = {
    _id: "mongoconf",
    members: [
      {_id: 0, host: "mongocfg1:27017"},
      {_id: 1, host: "mongocfg2:27017"},
    ]
  }
rs.initiate(rsconf)
rs.status()

exit // exit config server RS and create the other two RS

mongosh --host mongo-shard1

rsconf = {
  _id: "mongors1",
  members: [
    {_id: 0, host: "mongo-shard1:27017"},
  ]
}
rs.initiate(rsconf)
rs.status()

exit

mongosh --host mongo-shard2

rsconf = {
  _id: "mongors2",
  members: [
    {_id: 0, host: "mongo-shard2:27017"},
  ]
}
rs.initiate(rsconf)
rs.status()

exit
exit // change container to mongos router

docker exec -it mongos /bin/bash
mongosh
use admin
sh.addShard("mongors1/mongo-shard1:27017" )
sh.addShard("mongors2/mongo-shard2:27017" )
sh.status()

sh.enableSharding("oreilly")
db.test.createIndex({ "age" : "hashed" })
sh.shardCollection("oreilly.test", {"age":"hashed"}, false, { numInitialChunks: 10 })

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

for (i=0; i<1000; i++) {db.test.insert({age: getRandomInt(0,95), grade: getRandomInt(1,10)})}

sh.status()

db.test.explain().find()