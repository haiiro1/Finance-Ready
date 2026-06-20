from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.database.session import get_session
from app.modules.auth.schemas import RegisterResponse, UserRegisterRequest
from app.modules.auth.service import register_user

router = APIRouter()


@router.get("/status")
def auth_status() -> dict[str, str]:
    return {"module": "auth", "status": "active"}


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(
    request: UserRegisterRequest,
    session: Session = Depends(get_session),
) -> RegisterResponse:
    try:
        return register_user(request, session)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
