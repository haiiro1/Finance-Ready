from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_transactions() -> list[dict[str, str]]:
    return []

