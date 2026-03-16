import json
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import defaultdict

from config import DEFAULT_SEARCH_RESULTS, DEFAULT_EXPANSION_COUNT
from agents.analyst_agent import stream_llm_summary
from agents.workflow import run_research_pipeline

app = FastAPI(title="Research Engine API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            # Relay status/logs/errors/tokens
            yield f"event: {event['type']}\ndata: {json.dumps(event['data'])}\n\n"
        elif event["type"] == "error":
            # Map known errors
            error_data = event['data']
            if "ollama is not running" in error_data.lower():
                error_data = ERROR_MESSAGES["ollama_offline"]
            elif "no relevant sources" in error_data.lower():
                error_data = ERROR_MESSAGES["no_results"]
            yield f"event: error\ndata: {json.dumps(error_data)}\n\n"
            return
        elif event["type"] == "done":
            # Conversational path finishes here with "done" event containing full response
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

@app.post("/api/research")
async def research(request: ResearchRequest):
    session_id = request.session_id or "default"
    history = sessions[session_id]
    
    return StreamingResponse(
        run_pipeline_sse(request.query, request.max_results, request.expand_count, history, session_id),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
