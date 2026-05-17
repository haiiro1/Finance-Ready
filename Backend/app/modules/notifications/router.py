from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_notifications() -> list[dict[str, str]]:
    return []

