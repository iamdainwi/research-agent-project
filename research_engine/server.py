import json
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

async def run_pipeline_sse(query: str, max_results: int, expand_count: int):
    """
    Consumes the unified research pipeline and yields SSE events.
    """
    final_articles = []
    
    # 1. Run Research Phase
    async for event in run_research_pipeline(query, max_results, expand_count):
        if event["type"] == "result":
            final_articles = event["data"]
            # Yield sources for frontend display
            yield f"event: sources\ndata: {json.dumps(final_articles)}\n\n"
        else:
            # Relay status/logs/errors
            yield f"event: {event['type']}\ndata: {json.dumps(event['data'])}\n\n"
            if event["type"] == "error":
                return

    if not final_articles:
        return

    # 2. Run Summary Phase
    yield f"event: status\ndata: {json.dumps('Generating summary...')}\n\n"
    async for token in stream_llm_summary(final_articles, query):
        yield f"event: token\ndata: {json.dumps(token)}\n\n"

    yield f"event: done\ndata: {json.dumps('Research complete.')}\n\n"

@app.post("/api/research")
async def research(request: ResearchRequest):
    return StreamingResponse(
        run_pipeline_sse(request.query, request.max_results, request.expand_count),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
