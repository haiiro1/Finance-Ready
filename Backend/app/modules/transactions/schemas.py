from datetime import datetime
from enum import Enum

from pydantic import ConfigDict, field_validator, model_validator
from sqlmodel import SQLModel

from app.modules.transactions.models import visible_name


class CategoryType(str, Enum):
    income = "income"
    expense = "expense"


class ColorToken(str, Enum):
    slate = "slate"
    sky = "sky"
    teal = "teal"
    violet = "violet"
    fuchsia = "fuchsia"
    cyan = "cyan"
    orange = "orange"
    pink = "pink"
    emerald = "emerald"
    amber = "amber"
    indigo = "indigo"
    rose = "rose"


def _clean_name(value: str) -> str:
    cleaned = visible_name(value)
    if not cleaned:
        raise ValueError("name cannot be empty")
    if len(cleaned) > 80:
        raise ValueError("name must be at most 80 characters")
    return cleaned


class CategoryCreate(SQLModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    type: CategoryType
    color_token: ColorToken

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        return _clean_name(v)


class CategoryUpdate(SQLModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = None
    color_token: ColorToken | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return _clean_name(v)

    @model_validator(mode="after")
    def at_least_one_field(self) -> "CategoryUpdate":
        if self.name is None and self.color_token is None:
            raise ValueError("at least one field must be provided")
        return self


class CategoryResponse(SQLModel):
    id: int
    name: str
    type: CategoryType
    color_token: ColorToken
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class CategoryListResponse(SQLModel):
    items: list[CategoryResponse]
    next_cursor: str | None
    has_more: bool
