import json

# Load JSON file
with open("test.json") as f:
    data = json.load(f)

print(data.keys())