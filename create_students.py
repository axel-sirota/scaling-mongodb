import json
import random

users = 1000000 
subjects = ["Chemistry", "Biology", "Literature", "Mathematics"]
grades = ["E", "D", "C", "B", "A"]
ages = range(12, 18)
results = []

for id in range(users):
    for subject in subjects:
        student = {"student_id": id}
        grade = random.choice(grades)
        age = random.choice(ages)
        student["subject"] = subject
        student["grade"] = grade
        student["age"] = age
        results.append(student)

with open('students.json', 'w') as fp:
    for result in results:
        fp.write(json.dumps(result))
        fp.write("\n")    



