print("🔥 BACKEND RUNNING...")

from fastapi import FastAPI, Body
import sqlite3
from fastapi.middleware.cors import CORSMiddleware
from hashlib import sha256

app = FastAPI()

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= DB =================
conn = sqlite3.connect("database.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    category TEXT,
    priority TEXT,
    sentiment TEXT,
    status TEXT
)
""")

conn.commit()

# ================= AI =================
def analyze_text(text):
    text = text.lower()

    category = "General"
    if "road" in text:
        category = "Road"
    elif "water" in text:
        category = "Water"
    elif "electric" in text:
        category = "Electricity"

    priority = "Low"
    if any(w in text for w in ["fire", "danger", "accident"]):
        priority = "High"
    elif "urgent" in text:
        priority = "Medium"

    sentiment = "Neutral"
    if any(w in text for w in ["bad", "problem", "issue"]):
        sentiment = "Negative"

    return category, priority, sentiment


# ================= SIGNUP =================
@app.post("/signup")
def signup(data: dict = Body(...)):

    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "user").lower()

    hashed = sha256(password.encode()).hexdigest()

    try:
        cursor.execute(
            "INSERT INTO users(username, password, role) VALUES (?, ?, ?)",
            (username, hashed, role)
        )
        conn.commit()

        return {"status": "success"}

    except:
        return {"status": "fail", "msg": "User exists"}


# ================= LOGIN =================
@app.post("/login")
def login(data: dict = Body(...)):

    username = data.get("username")
    password = data.get("password")

    hashed = sha256(password.encode()).hexdigest()

    cursor.execute(
        "SELECT role FROM users WHERE username=? AND password=?",
        (username, hashed)
    )

    result = cursor.fetchone()

    if result:
        return {"status": "success", "role": result[0]}

    return {"status": "fail"}


# ================= ANALYZE =================
@app.post("/analyze")
def analyze(data: dict = Body(...)):

    text = data.get("text")

    category, priority, sentiment = analyze_text(text)

    cursor.execute(
        "INSERT INTO complaints(text, category, priority, sentiment, status) VALUES (?,?,?,?,?)",
        (text, category, priority, sentiment, "Pending")
    )

    conn.commit()

    return {
        "category": category,
        "priority": priority,
        "sentiment": sentiment
    }


# ================= GET =================
@app.get("/complaints")
def get_all():
    cursor.execute("SELECT * FROM complaints ORDER BY id DESC")
    return cursor.fetchall()


# ================= UPDATE =================
@app.put("/update/{cid}")
def update(cid: int, status: str = Body(...)):
    cursor.execute(
        "UPDATE complaints SET status=? WHERE id=?",
        (status, cid)
    )
    conn.commit()

    return {"msg": "updated"}


    
from hashlib import sha256

cursor.execute(
    "INSERT OR IGNORE INTO users(username, password, role) VALUES (?, ?, ?)",
    ("admin", sha256("admin123".encode()).hexdigest(), "admin")
)

conn.commit()