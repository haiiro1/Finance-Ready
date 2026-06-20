from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel


class UserRegisterRequest(SQLModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str | None = None

    @field_validator("password")
    @classmethod
    def password_must_have_letter_and_number(cls, v: str) -> str:
        if not any(c.isalpha() for c in v):
            raise ValueError("Password must contain at least one letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

    @field_validator("full_name", mode="before")
    @classmethod
    def clean_full_name(cls, v: str | None) -> str | None:
        if v is None:
            return None
        stripped = v.strip()
        return stripped if stripped else None


class UserResponse(SQLModel):
    id: int
    email: str
    full_name: str | None
    is_active: bool


class RegisterResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
