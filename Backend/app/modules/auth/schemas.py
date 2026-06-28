from pydantic import EmailStr, field_validator, model_validator
from sqlmodel import Field, SQLModel


def _validate_password_strength(v: str) -> str:
    if not any(c.isalpha() for c in v):
        raise ValueError("Password must contain at least one letter")
    if not any(c.isdigit() for c in v):
        raise ValueError("Password must contain at least one number")
    return v


class UserRegisterRequest(SQLModel):
    email: EmailStr
    password: str = Field(min_length=8)
    password_confirmation: str
    full_name: str | None = None

    @field_validator("password")
    @classmethod
    def password_must_have_letter_and_number(cls, v: str) -> str:
        return _validate_password_strength(v)

    @model_validator(mode="after")
    def passwords_match(self) -> "UserRegisterRequest":
        if self.password != self.password_confirmation:
            raise ValueError("Passwords do not match")
        return self

    @field_validator("full_name", mode="before")
    @classmethod
    def clean_full_name(cls, v: str | None) -> str | None:
        if v is None:
            return None
        stripped = v.strip()
        return stripped if stripped else None


class UserLoginRequest(SQLModel):
    email: EmailStr
    password: str


class UserResponse(SQLModel):
    id: int
    email: str
    full_name: str | None
    is_active: bool
    email_verified: bool


class AuthResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RegisterResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    verification_code: str | None = None
    email_sent: bool = True


class PasswordRecoveryRequest(SQLModel):
    email: EmailStr


class PasswordRecoveryRequestResponse(SQLModel):
    message: str
    recovery_code: str | None = None
    email_sent: bool = True


class PasswordResetConfirmRequest(SQLModel):
    email: EmailStr
    code: str = Field(min_length=1)
    new_password: str = Field(min_length=8)
    new_password_confirmation: str

    @field_validator("new_password")
    @classmethod
    def new_password_must_have_letter_and_number(cls, v: str) -> str:
        return _validate_password_strength(v)

    @model_validator(mode="after")
    def new_passwords_match(self) -> "PasswordResetConfirmRequest":
        if self.new_password != self.new_password_confirmation:
            raise ValueError("Passwords do not match")
        return self


class PasswordResetConfirmResponse(SQLModel):
    message: str


class EmailVerificationConfirmRequest(SQLModel):
    email: EmailStr
    code: str = Field(min_length=1)


class EmailVerificationConfirmResponse(SQLModel):
    message: str


class EmailVerificationResendRequest(SQLModel):
    email: EmailStr


class EmailVerificationResendResponse(SQLModel):
    message: str
    verification_code: str | None = None
    email_sent: bool = True


class GoogleLoginRequest(SQLModel):
    credential: str
