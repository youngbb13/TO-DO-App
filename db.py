import sqlite3
from typing import List, Optional, Dict

DB_FILE = "todo.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            done INTEGER NOT NULL DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()

def get_all_todos() -> List[Dict]:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, description, done FROM todos")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": row[0], "title": row[1], "description": row[2], "done": bool(row[3])} for row in rows]

def get_todo(todo_id: int) -> Optional[Dict]:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, description, done FROM todos WHERE id = ?", (todo_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"id": row[0], "title": row[1], "description": row[2], "done": bool(row[3])}
    return None

def create_todo(title: str, description: Optional[str]) -> Dict:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO todos (title, description) VALUES (?, ?)", (title, description))
    conn.commit()
    todo_id = cursor.lastrowid
    conn.close()
    return get_todo(todo_id)

def update_todo(todo_id: int, title: str, description: Optional[str], done: bool) -> Optional[Dict]:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE todos SET title = ?, description = ?, done = ? WHERE id = ?",
        (title, description, int(done), todo_id)
    )
    conn.commit()
    conn.close()
    return get_todo(todo_id)

def delete_todo(todo_id: int) -> bool:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted
