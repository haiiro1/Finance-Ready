from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_loans() -> list[dict[str, str]]:
    return []

