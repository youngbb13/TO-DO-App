from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from task_manager.services import todo_service

router = APIRouter()

class TodoCreate(BaseModel):
    task: str

class TodoResponse(TodoCreate):
    id: int
    done: int  # 0 або 1 з SQLite

@router.get("/", response_model=list[TodoResponse])
def get_items():
    return todo_service.get_all()

@router.post("/", response_model=TodoResponse)
def create_item(data: TodoCreate):
    return todo_service.create(data.task)

@router.delete("/{todo_id}")
def delete_item(todo_id: int):
    if not todo_service.delete(todo_id):
        raise HTTPException(status_code=404, detail="not found")
    return {"ok": True}

@router.patch("/{todo_id}")
def toggle_item(todo_id: int):
    if not todo_service.toggle(todo_id):
        raise HTTPException(status_code=404, detail="not found")
    return {"ok": True}
