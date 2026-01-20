from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from task_manager.models.todo import Todo, TodoCreate
from task_manager.services import todo_service

router = APIRouter()

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

@router.get("/", response_model=list[Todo])
def get_items():
    return todo_service.get_all()

@router.post("/", response_model=Todo)
def create_item():
    return todo_service.create(data)

@router.delete("/{todo_id}")
def delete_item(todo_id: int):
    if not todo_service.delete(todo_id):
        raise HTTPException(status_code=404, detail="not found")
    return {"ok": True}

@router.patch("/{todo_id}", response_model=Todo)
def toggle_item(todo_id: int):
    todo = todo_service.toggle(todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="not found")
    return todo