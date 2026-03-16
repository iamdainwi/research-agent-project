from pydantic import BaseModel, Field
from datetime import datetime


class APIKeyCreate(BaseModel):
    name: str


class APIKeyInDB(BaseModel):
    id: str
    user: str
    name: str
    key: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class APIKeyResponse(BaseModel):
    id: str
    name: str
    createdAt: datetime
