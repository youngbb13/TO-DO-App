from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import db

# Ініціалізація бази
db.init_db()

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# Модель для валідації
class TodoItem(BaseModel):
    title: str
    description: Optional[str] = None
    done: Optional[bool] = False

# CRUD API
@app.get("/api/todos")
def list_todos():
    return db.get_all_todos()

@app.get("/api/todos/{todo_id}")
def get_todo(todo_id: int):
    todo = db.get_todo(todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@app.post("/api/todos")
def create_todo(item: TodoItem):
    if not item.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    todo = db.create_todo(item.title, item.description)
    return todo

@app.put("/api/todos/{todo_id}")
def update_todo(todo_id: int, item: TodoItem):
    todo = db.update_todo(todo_id, item.title, item.description, item.done)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@app.delete("/api/todos/{todo_id}")
def delete_todo(todo_id: int):
    deleted = db.delete_todo(todo_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Todo not found")
    return JSONResponse(content={"message": "Todo deleted"})

# Віддаємо фронтенд
@app.get("/")
def serve_frontend():
    return FileResponse("static/index.html")
