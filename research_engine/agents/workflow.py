import json
from typing import AsyncGenerator, Any

from config import logger
from agents.search_agent import expand_queries, search_multiple_queries, extract_links
from agents.ranker_agent import rerank_articles
from utils.scraper import fetch_pages
from utils.text_process import extract_articles, deduplicate

async def run_research_pipeline(query: str, max_results: int, expand_count: int) -> AsyncGenerator[Any, None]:
    """
    Async Generator that runs the research pipeline and yields event dictionaries.
    Events: 'status', 'log', 'error', 'result' (final articles)
    """
    try:
        yield {"type": "status", "data": "Starting research pipeline..."}
        logger.info(f"Received request: {query}")

        # 1. Expand
        yield {"type": "status", "data": "Expanding queries..."}
        queries = expand_queries(query, num_variations=expand_count)
        yield {"type": "log", "data": f"Expansions: {queries}"}

        # 2. Search
        yield {"type": "status", "data": f"Searching web for {len(queries)} queries..."}
        search_results = search_multiple_queries(queries, results_per_query=max_results)
        if not search_results:
            yield {"type": "error", "data": "No search results found."}
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
            yield {"type": "error", "data": "No relevant articles found after filtering."}
            return

        yield {"type": "result", "data": final_articles}

    except Exception as e:
        logger.error(f"Pipeline error: {e}", exc_info=True)
        yield {"type": "error", "data": str(e)}
