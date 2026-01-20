from typing import List
from task_manager.models.todo import Todo, TodoCreate

_todos: List[Todo] = []
_counter = 1

def get_all() -> List[Todo]:
    return _todos

def create(data: TodoCreate) -> Todo:
    global _counter
    todo = Todo(id=_counter, task=data.task, done=False)
    _counter += 1
    _todos.append(todo)
    return todo

def delete(todo_id: int) -> bool:
    global _todos
    before = len(_todos)
    _todos = [t for t in _todos if t.id != todo_id]
    return len(_todos) < before

def toggle(todo_id: int) -> Todo | None:
    for t in _todos:
        if t.id == todo_id:
            t.done = not t.done
            return t
    return None
