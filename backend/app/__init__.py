import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI


def get_root_dir_abs_path() -> str:
    """
    Get the absolute path to the root directory of the application.
    e.g., /electron-fastapi/backend/app
    """
    # Check if the application runs in a bundled executable from PyInstaller.
    # When executed, the bundled executable get's unpacked into the temporary directory sys._MEIPASS.
    # See also: https://pyinstaller.readthedocs.io/en/stable/runtime-information.html#using-file
    return getattr(sys, "_MEIPASS", os.path.abspath(os.path.dirname(__file__)))


def create_app() -> FastAPI:
    # Import the configuration object
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Startup code here

        yield
        # Cleanup/shutdown code here

    # Create the FastAPI application
    app = FastAPI(
        title="Electron-FastAPI",
        description="Electron with FastAPI backend",
        lifespan=lifespan,
    )
    # Import and include the main router
    from .routers import base

    app.include_router(base.router)

    # Return the application
    return app
