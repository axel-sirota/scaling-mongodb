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

exit
exit

docker exec -i mongos sh -c 'mongoimport -d oreilly -c sensor --type json' < sensor_data.json
docker exec -it mongos /bin/bash
mongosh
// Cardinality issues
use oreilly
db.sensor.createIndex({ "grade" : 1 })
sh.shardCollection("oreilly.sensor", {"grade" : 1}, false, { numInitialChunks: 10 })

sh.status()

// Let's run this query, due to cardinality it will go to a single shard!

db.sensor.find({"timestamp": {$gt: 1680385355}}).explain()

// Let's reshard

db.adminCommand({ reshardCollection: "oreilly.sensor", key: { "intensity" : 1 } })

// Let's monitor the operation!

// [ANOTHER TAB] 4

docker exec -it mongos /bin/bash
mongosh

db.getSiblingDB("admin").aggregate([
  { $currentOp: { allUsers: true, localOps: false } },
  {
    $match: {
      type: "op",
      "originatingCommand.reshardCollection": "oreilly.sensor"
    }
  }
])

// Going back let's check the status

sh.status()

// Now we have the new shard key let's check the distribution

db.sensor.getShardDistribution()

// We can see at the start out of the 3 chunks only 2 have data and they live in one shard. Let's see if the balancer helps

// We split

db.adminCommand({split: "oreilly.sensor", middle : { "intensity": 5 }})

// Again check

db.sensor.getShardDistribution()

sh.status()


