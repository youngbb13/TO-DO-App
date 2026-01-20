from pydantic import BaseModel

class TodoCreate(BaseModel):
    task: str

class Todo(TodoCreate):
    id: int
    done: bool = False