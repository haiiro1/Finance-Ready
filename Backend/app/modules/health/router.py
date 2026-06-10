from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check() -> dict[str, str]:
    """
    Checks if the application is healthy.
    """
    return {"status": "ok", "environment": settings.app_env}
