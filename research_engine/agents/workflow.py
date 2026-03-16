import json
from typing import AsyncGenerator, Any

from config import logger, OLLAMA_HOST, OLLAMA_API_KEY, MODEL_NAME
from ollama import AsyncClient

from agents.search_agent import expand_queries, search_multiple_queries, extract_links
from agents.ranker_agent import rerank_articles
from utils.scraper import fetch_pages
from utils.text_process import extract_articles, deduplicate

CLASSIFIER_PROMPT = """You are a query classifier. Classify the given query into one of two categories:

CONVERSATIONAL: greetings, simple questions the LLM already knows (e.g. "hi", "what is python", "who is Elon Musk", "what is 2+2", "tell me a joke", "how are you", "what can you do")

RESEARCH: queries requiring current web information, recent events, statistics, news, deep topic analysis, or anything that benefits from real-time data

Respond with ONLY one word: CONVERSATIONAL or RESEARCH

Query: {query}"""

CONVERSATIONAL_PROMPT = """You are a helpful, friendly AI assistant. 
Answer the following question directly and naturally from your own knowledge.
Do not mention searching the web or any research pipeline.

Question: {query}"""

async def classify_query(query: str, ollama_client: AsyncClient) -> str:
    """Returns 'CONVERSATIONAL' or 'RESEARCH'"""
    response = await ollama_client.chat(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": CLASSIFIER_PROMPT.format(query=query)}]
    )
    result = response["message"]["content"].strip().upper()
    return "CONVERSATIONAL" if "CONVERSATIONAL" in result else "RESEARCH"

async def handle_conversational(query: str, ollama_client: AsyncClient):
    """Stream direct LLM response for conversational queries"""
    async for chunk in await ollama_client.chat(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": CONVERSATIONAL_PROMPT.format(query=query)}],
        stream=True
    ):
        yield chunk["message"]["content"]

async def run_research_pipeline(query: str, max_results: int, expand_count: int, history: list = None) -> AsyncGenerator[Any, None]:
    """
    Async Generator that runs the research pipeline and yields event dictionaries.
    Events: 'status', 'log', 'error', 'result' (final articles), 'token', 'done'
    """
    try:
        ollama_client = AsyncClient(
            host=OLLAMA_HOST,
            headers={'Authorization': 'Bearer ' + str(OLLAMA_API_KEY) if OLLAMA_API_KEY else ''}
        )
        
        query_type = await classify_query(query, ollama_client)
        yield {"type": "query_type", "data": query_type}
        
        if query_type == "CONVERSATIONAL":
            yield {"type": "status", "data": "Thinking..."}
            
            # Format history for conversational if available
            context_prompt = CONVERSATIONAL_PROMPT.format(query=query)
            if history:
                ctx = "\\n".join([f"Previous Q: {h['query']}\\nPrevious A: {h['response'][:200]}..." 
                                     for h in history[-2:]])
                context_prompt = f"Previous conversation context:\\n{ctx}\\n\\n" + context_prompt

            response_accum = []
            async for chunk in await ollama_client.chat(
                model=MODEL_NAME,
                messages=[{"role": "user", "content": context_prompt}],
                stream=True
            ):
                token = chunk["message"]["content"]
                response_accum.append(token)
                yield {"type": "token", "data": token}
            
            yield {"type": "done", "data": "".join(response_accum)}
            return

        yield {"type": "status", "data": "Starting research pipeline..."}
        logger.info(f"Received request: {query}")

        # 1. Expand
        yield {"type": "status", "data": "Expanding queries..."}
        queries = expand_queries(query, num_variations=expand_count)
        yield {"type": "log", "data": f"Expansions: {queries}"}

        # 2. Search
        yield {"type": "status", "data": f"Searching web for {len(queries)} queries..."}
        search_results = await search_multiple_queries(queries, results_per_query=max_results)
        if not search_results:
            yield {"type": "error", "data": "No relevant sources found. Try rephrasing your query."}
            return
        
        # 3. Extract Links
        links = extract_links(search_results)
        yield {"type": "log", "data": f"Found {len(links)} links."}

        # 4. Fetch Pages
        yield {"type": "status", "data": f"Fetching {len(links)} pages..."}
        pages = await fetch_pages(links)
        
        # 5. Extract Content
        yield {"type": "status", "data": "Processing content..."}
        articles = extract_articles(pages)
        
        # 6. Deduplicate
        articles = deduplicate(articles)
        yield {"type": "log", "data": f"Extracted {len(articles)} unique articles."}

        # 7. Rerank
        yield {"type": "status", "data": "Reranking articles..."}
        final_articles = rerank_articles(articles, query, top_n=5)
        yield {"type": "log", "data": f"Selected top {len(final_articles)} articles."}

        if not final_articles:
            yield {"type": "error", "data": "No relevant sources found after filtering."}
            return

        yield {"type": "result", "data": final_articles}

    except Exception as e:
        logger.error(f"Pipeline error: {e}", exc_info=True)
        # Using error messages from step 6 for default
        if "ollama" in str(e).lower() or "connection" in str(e).lower():
            yield {"type": "error", "data": "Ollama is not running. Start it with: ollama serve"}
        else:
            yield {"type": "error", "data": str(e)}
