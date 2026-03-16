from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class QuotaDetail(BaseModel):
    count: int = 0
    limit: int = 3


class Quota(BaseModel):
    research: QuotaDetail = QuotaDetail(count=0, limit=3)
    download: QuotaDetail = QuotaDetail(count=0, limit=2)
    lastReset: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserInDB(BaseModel):
    id: str
    name: str
    email: str
    quota: Quota = Quota()
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    quota: Quota
