from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_subscriptions() -> list[dict[str, str]]:
    return []

