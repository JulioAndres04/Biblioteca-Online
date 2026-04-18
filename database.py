import json
import os

DB_FILE = "data.json"

def load_data():
    if not os.path.exists(DB_FILE):
        return {"books": [], "loans": [], "users": []}
    with open(DB_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)