from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings


def create_app() -> FastAPI:
    """
    Creates the FastAPI application.
    """
    app = FastAPI(
        title=settings.app_name,
        description="Backend for Finance Ready personal finance platform.",
        version="0.1.0",
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include the main API router
    app.include_router(api_router, prefix=settings.api_prefix)

    return app


app = create_app()
