import sqlite3

DB_FILE = "todo.db"

def get_connection():
    return sqlite3.connect(DB_FILE)

def init_db():
    with get_connection() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            done INTEGER NOT NULL DEFAULT 0
        )
        """)

def get_all_todos():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, title, description, done FROM todos"
        ).fetchall()
    return [
        {"id": r[0], "title": r[1], "description": r[2], "done": bool(r[3])}
        for r in rows
    ]

def get_todo(todo_id: int):
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, title, description, done FROM todos WHERE id=?",
            (todo_id,)
        ).fetchone()
    if row:
        return {"id": row[0], "title": row[1], "description": row[2], "done": bool(row[3])}

def create_todo(title, description):
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO todos (title, description) VALUES (?, ?)",
            (title, description)
        )
        todo_id = cur.lastrowid
    return get_todo(todo_id)

def update_todo(todo_id, title, description, done):
    with get_connection() as conn:
        cur = conn.execute(
            "UPDATE todos SET title=?, description=?, done=? WHERE id=?",
            (title, description, int(done), todo_id)
        )
        if cur.rowcount == 0:
            return None
    return get_todo(todo_id)

def delete_todo(todo_id):
    with get_connection() as conn:
        cur = conn.execute(
            "DELETE FROM todos WHERE id=?",
            (todo_id,)
        )
        return cur.rowcount > 0
