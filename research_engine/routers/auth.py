import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Request
from bson import ObjectId

from database import users_collection, apikeys_collection
from models.user import UserCreate, UserLogin, UserResponse, Quota, QuotaDetail
from models.api_key import APIKeyCreate, APIKeyResponse
from utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


# ─── Register ────────────────────────────────────────────────
@router.post("/register")
async def register(payload: UserCreate):
    # Check if email already exists
    existing = await users_collection.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed = hash_password(payload.password)
    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "password": hashed,
        "quota": {
            "research": {"count": 0, "limit": 3},
            "download": {"count": 0, "limit": 2},
            "lastReset": datetime.now(timezone.utc),
        },
        "createdAt": datetime.now(timezone.utc),
    }
    result = await users_collection.insert_one(user_doc)
    token = create_access_token(str(result.inserted_id))
    return {"success": True, "token": token}


# ─── Login ───────────────────────────────────────────────────
@router.post("/login")
async def login(payload: UserLogin):
    user = await users_collection.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(str(user["_id"]))
    return {"success": True, "token": token}


# ─── Get Current User ────────────────────────────────────────
@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "data": {
            "id": current_user["id"],
            "name": current_user["name"],
            "email": current_user["email"],
            "quota": current_user.get("quota", {}),
        },
    }


# ─── Generate API Key ────────────────────────────────────────
@router.post("/apikey")
async def generate_api_key(
    payload: APIKeyCreate, current_user: dict = Depends(get_current_user)
):
    if not payload.name:
        raise HTTPException(status_code=400, detail="Please provide a name for the key")

    key = secrets.token_hex(32)
    await apikeys_collection.insert_one(
        {
            "user": ObjectId(current_user["id"]),
            "name": payload.name,
            "key": key,
            "createdAt": datetime.now(timezone.utc),
        }
    )
    return {"success": True, "data": {"name": payload.name, "key": key}}


# ─── List API Keys ───────────────────────────────────────────
@router.get("/apikeys")
async def get_api_keys(current_user: dict = Depends(get_current_user)):
    cursor = apikeys_collection.find({"user": ObjectId(current_user["id"])})
    keys = []
    async for doc in cursor:
        keys.append(
            {
                "id": str(doc["_id"]),
                "name": doc["name"],
                "createdAt": doc["createdAt"].isoformat() if doc.get("createdAt") else None,
            }
        )
    return {"success": True, "data": keys}


# ─── Delete API Key ──────────────────────────────────────────
@router.delete("/apikey/{key_id}")
async def delete_api_key(key_id: str, current_user: dict = Depends(get_current_user)):
    try:
        doc = await apikeys_collection.find_one({"_id": ObjectId(key_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="API Key not found")

    if not doc:
        raise HTTPException(status_code=404, detail="API Key not found")

    if str(doc["user"]) != current_user["id"]:
        raise HTTPException(status_code=401, detail="Not authorized to delete this key")

    await apikeys_collection.delete_one({"_id": ObjectId(key_id)})
    return {"success": True, "data": {}}
