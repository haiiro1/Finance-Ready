from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_banks() -> list[dict[str, str]]:
    return []

