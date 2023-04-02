import json
import random
import time

users = 4000000 
intensities = range(1, 11)
units = ["mtrs", "in", "K", "C", "F"]
results = []

for id in range(users):
    sensor_data = {"timestamp": time.time()}
    unit = random.choice(units)
    intensity = random.choice(intensities)
    sensor_data["unit"] = unit
    sensor_data["intensity"] = intensity
    sensor_data["_id"] = id
    results.append(sensor_data)
    time.sleep(random.random())

with open('sensor_data.json', 'w') as fp:
    for result in results:
        fp.write(json.dumps(result))
        fp.write("\n")    


