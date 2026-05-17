from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_cards() -> list[dict[str, str]]:
    return []

