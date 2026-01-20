from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pathlib import Path

from task_manager.routers import items

app = FastAPI(title="To-Do App")

BASE_DIR = Path(__file__).resolve().parent

# API
app.include_router(items.router, prefix="/api/items")

# Статичні файли
app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "frontend"),
    name="static"
)

# Головна сторінка
@app.get("/", response_class=HTMLResponse)
async def index():
    return (BASE_DIR / "frontend" / "index.html").read_text(encoding="utf-8")