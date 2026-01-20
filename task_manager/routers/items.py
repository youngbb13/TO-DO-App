from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()   # ⬅️ ЦЕ КЛЮЧОВИЙ РЯДОК

class Todo(BaseModel):
    id: int | None = None
    task: str

todos = []
counter = 1

@router.get("/")
async def get_all():
    return todos

@router.post("/")
async def create(todo: Todo):
    global counter
    todo.id = counter
    counter += 1
    todos.append(todo)
    return todo

@router.delete("/{todo_id}")
async def delete(todo_id: int):
    global todos
    todos = [t for t in todos if t.id != todo_id]
    return {"ok": True}
