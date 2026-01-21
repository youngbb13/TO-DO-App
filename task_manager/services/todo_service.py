from task_manager.database import get_connection

def get_all():
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM todos ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]

def create(task: str):
    conn = get_connection()
    cur = conn.execute(
        "INSERT INTO todos (task) VALUES (?)",
        (task,)
    )
    conn.commit()
    todo_id = cur.lastrowid
    conn.close()
    return {"id": todo_id, "task": task, "done": 0}

def delete(todo_id: int) -> bool:
    conn = get_connection()
    cur = conn.execute(
        "DELETE FROM todos WHERE id = ?",
        (todo_id,)
    )
    conn.commit()
    conn.close()
    return cur.rowcount > 0

def toggle(todo_id: int) -> bool:
    conn = get_connection()
    cur = conn.execute(
        "UPDATE todos SET done = NOT done WHERE id = ?",
        (todo_id,)
    )
    conn.commit()
    conn.close()
    return cur.rowcount > 0
