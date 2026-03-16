import json
from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import defaultdict
from bson import ObjectId

from config import DEFAULT_SEARCH_RESULTS, DEFAULT_EXPANSION_COUNT
from agents.analyst_agent import stream_llm_summary
from agents.workflow import run_research_pipeline
from database import users_collection, apikeys_collection
from utils.security import get_current_user, decode_access_token
from routers.auth import router as auth_router

app = FastAPI(title="Research Engine API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Mount Auth Router ────────────────────────────────────────
app.include_router(auth_router)

# ─── Models ───────────────────────────────────────────────────

class ResearchRequest(BaseModel):
    query: str
    max_results: int = DEFAULT_SEARCH_RESULTS
    expand_count: int = DEFAULT_EXPANSION_COUNT
    session_id: str = "default"

sessions: dict[str, list] = defaultdict(list)

ERROR_MESSAGES = {
    "ddg_ratelimit": "Search rate limit hit. Retrying in a moment...",
    "ollama_offline": "Ollama is not running. Start it with: ollama serve",
    "no_results": "No relevant sources found. Try rephrasing your query.",
    "timeout": "Some sources took too long to load but we continued with what we found."
}


# ─── Quota Check ──────────────────────────────────────────────

async def check_quota(user: dict, quota_type: str = "research"):
    """
    Check and reset daily quotas. Raises HTTPException if over limit.
    """
    now = datetime.now(timezone.utc)
    quota = user.get("quota", {})
    last_reset = quota.get("lastReset", now)

    if isinstance(last_reset, str):
        last_reset = datetime.fromisoformat(last_reset)

    # Reset if it's a new day
    if (now.date() != last_reset.date()):
        await users_collection.update_one(
            {"_id": ObjectId(user["id"])},
            {"$set": {
                "quota.research.count": 0,
                "quota.download.count": 0,
                "quota.lastReset": now,
            }}
        )
        quota["research"]["count"] = 0
        quota["download"]["count"] = 0

    type_quota = quota.get(quota_type, {"count": 0, "limit": 3})
    if type_quota["count"] >= type_quota["limit"]:
        raise HTTPException(
            status_code=429,
            detail=f"Daily {quota_type} quota exceeded. Limit is {type_quota['limit']}."
        )


# ─── Pipeline SSE ─────────────────────────────────────────────

async def run_pipeline_sse(query: str, max_results: int, expand_count: int, history: list, session_id: str):
    """
    Consumes the unified research pipeline and yields SSE events.
    """
    final_articles = []

    # 1. Run Research Phase
    async for event in run_research_pipeline(query, max_results, expand_count, history):
        # Allow frontend to distinguish conversational
        if event["type"] == "query_type":
            yield f"event: query_type\ndata: {json.dumps(event['data'])}\n\n"
        elif event["type"] == "result":
            final_articles = event["data"]
            # Yield sources for frontend display
            yield f"event: sources\ndata: {json.dumps(final_articles)}\n\n"
        elif event["type"] in ["status", "log", "token"]:
            yield f"event: {event['type']}\ndata: {json.dumps(event['data'])}\n\n"
        elif event["type"] == "error":
            error_data = event['data']
            if "ollama is not running" in error_data.lower():
                error_data = ERROR_MESSAGES["ollama_offline"]
            elif "no relevant sources" in error_data.lower():
                error_data = ERROR_MESSAGES["no_results"]
            yield f"event: error\ndata: {json.dumps(error_data)}\n\n"
            return
        elif event["type"] == "done":
            response_text = event.get("data", "")
            if response_text:
                sessions[session_id].append({
                    "query": query,
                    "response": response_text
                })
            yield f"event: done\ndata: {json.dumps('Research complete.')}\n\n"
            return

    if not final_articles:
        return

    # 2. Run Summary Phase
    yield f"event: status\ndata: {json.dumps('Generating summary...')}\n\n"
    response_accum = []
    async for token in stream_llm_summary(final_articles, query, history):
        response_accum.append(token)
        yield f"event: token\ndata: {json.dumps(token)}\n\n"

    final_response = "".join(response_accum)
    sessions[session_id].append({
        "query": query,
        "response": final_response
    })

    yield f"event: done\ndata: {json.dumps('Research complete.')}\n\n"


# ─── Protected Research Endpoint ──────────────────────────────

@app.post("/api/v1/research")
async def research_protected(
    request: ResearchRequest,
    current_user: dict = Depends(get_current_user),
):
    """Protected research endpoint with quota enforcement."""
    # Check quota
    await check_quota(current_user, "research")

    # Increment usage
    await users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$inc": {"quota.research.count": 1}}
    )

    session_id = request.session_id or "default"
    history = sessions[session_id]

    return StreamingResponse(
        run_pipeline_sse(request.query, request.max_results, request.expand_count, history, session_id),
        media_type="text/event-stream"
    )


# ─── Public Research Endpoint (backwards compat) ──────────────

@app.post("/api/research")
async def research_public(request: ResearchRequest):
    """Unprotected research endpoint for local/dev usage."""
    session_id = request.session_id or "default"
    history = sessions[session_id]

    return StreamingResponse(
        run_pipeline_sse(request.query, request.max_results, request.expand_count, history, session_id),
        media_type="text/event-stream"
    )


# ─── Download Endpoint ────────────────────────────────────────

@app.get("/api/v1/research/download")
async def download(current_user: dict = Depends(get_current_user)):
    """Protected download endpoint with quota enforcement."""
    await check_quota(current_user, "download")

    await users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$inc": {"quota.download.count": 1}}
    )

    return {"success": True, "message": "Download approved"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
