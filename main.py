from fastapi import FastAPI
from fastapi.responses import FileResponse
from starlette.staticfiles import StaticFiles

from crud import router
import db

def create_app() -> FastAPI:
    db.init_db()

    app = FastAPI(title="TodoApp")

    app.include_router(router, prefix="/api")

    app.mount("/static", StaticFiles(directory="static"), name="static")

    @app.get("/")
    def frontend():
        return FileResponse("static/index.html")

    return app

app = create_app()