from pydantic import BaseModel
from typing import Optional

class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    done: bool = False

class TodoCreate(TodoBase):
    pass

class Todo(TodoBase):
    id: int
