from fastapi import APIRouter, HTTPException
from typing import List

import db
from schemas import Todo, TodoCreate

router = APIRouter(tags=["Todos"])

@router.get("/todos", response_model=List[Todo])
def get_todos():
    return db.get_all_todos()

@router.get("/todos/{todo_id}", response_model=Todo)
def get_todo(todo_id: int):
    todo = db.get_todo(todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@router.post("/todos", response_model=Todo)
def create_todo(todo: TodoCreate):
    if not todo.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    return db.create_todo(todo.title, todo.description)

@router.put("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, todo: TodoCreate):
    updated = db.update_todo(
        todo_id,
        todo.title,
        todo.description,
        todo.done
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Todo not found")
    return updated

@router.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    if not db.delete_todo(todo_id):
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted"}
