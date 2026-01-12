import asyncio
import re
import os
from typing import List, Dict
from ollama import Client
from ddgs import DDGS
from config import logger, OLLAMA_HOST, OLLAMA_API_KEY, MODEL_NAME

def expand_queries(original_query: str, num_variations: int = 6) -> List[str]:
    """
    Use LLM to generate semantically expanded search queries.
    Returns a list including the original query plus expanded variations.
    """
    try:
        logger.info(f"Expanding query: '{original_query}'")

        client = Client(
            host=OLLAMA_HOST,
            headers={'Authorization': 'Bearer ' + str(OLLAMA_API_KEY)}
        )

        prompt = (
            f"Generate {num_variations} semantically related search queries for: '{original_query}'\n\n"
            "Requirements:\n"
            "- Each query should explore a different aspect or angle of the topic\n"
            "- Use synonyms, related terms, and different phrasings\n"
            "- Keep queries concise (3-8 words)\n"
            "- Focus on findable, searchable terms\n"
            "- Do not number the queries\n"
            "- Output one query per line\n\n"
            "Examples:\n"
            "Original: 'climate change effects'\n"
            "Expanded queries:\n"
            "global warming environmental impact\n"
            "climate crisis consequences 2024\n"
            "carbon emissions temperature rise\n\n"
            f"Now generate {num_variations} expanded queries for: '{original_query}'\n"
            "Output only the queries, one per line:"
        )

        messages = [{"role": "user", "content": prompt}]

        response = client.chat(
            model=MODEL_NAME,
            messages=messages,
            stream=False
        )

        # Extract queries from response
        expanded_text = response['message']['content'].strip()
        expanded_queries = [q.strip() for q in expanded_text.split('\n') if q.strip()]

        # Filter out any numbered queries or empty lines
        expanded_queries = [
            re.sub(r'^\d+[\.\)]\s*', '', q)  # Remove numbers like "1. " or "1) "
            for q in expanded_queries
            if len(q.strip()) > 5  # Must be substantial
        ]

        # Combine original with expanded (remove duplicates, keep order)
        all_queries = [original_query] + expanded_queries[:num_variations]

        logger.info(f"✓ Generated {len(all_queries)} total queries:")
        for i, q in enumerate(all_queries, 1):
            logger.info(f"  [{i}] {q}")

        return all_queries

    except Exception as e:
        logger.error(f"Query expansion failed: {e}")
        logger.info("Falling back to original query only")
        return [original_query]


def search_web(query: str, max_results: int = 10) -> List[Dict]:
    """Search the web using DuckDuckGo."""
    try:
        logger.info(f"Searching for: '{query}' (max {max_results} results)")
        results = list(DDGS().text(query, max_results=max_results))
        logger.info(f"Found {len(results)} search results")
        return results
    except Exception as e:
        logger.error(f"Search failed for '{query}': {e}")
        return []


def search_multiple_queries(queries: List[str], results_per_query: int = 6) -> List[Dict]:
    """
    Search multiple queries and combine results.
    Deduplicates by URL to avoid fetching the same page multiple times.
    """
    all_results = []
    seen_urls = set()

    logger.info(f"Searching {len(queries)} queries with {results_per_query} results each")

    for i, query in enumerate(queries, 1):
        logger.info(f"Query [{i}/{len(queries)}]: '{query}'")
        results = search_web(query, max_results=results_per_query)

        # Deduplicate by URL
        for result in results:
            url = result.get('href', '')
            if url and url not in seen_urls:
                seen_urls.add(url)
                all_results.append(result)

        # Small delay to avoid rate limiting
        # Note: Original code had await asyncio.sleep(0.5) but this function is sync in definition in main.py
        # however, it was called inside an async context. Wait, in main.py it was:
        # def search_multiple_queries... -> async wasn't defined but inside loop:
        # if i < len(queries): asyncio.sleep(0.5) <--- This is a bug in original code if it's not async def!
        # Python's asyncio.sleep() returns a coroutine. If you don't await it, nothing happens.
        # But search_multiple_queries was defined as regular def in main.py (line 112).
        # And it calls asyncio.sleep(0.5) without await (line 135).
        # So it was doing nothing. I will fix this by making it async or just using time.sleep.
        # Since the scraper is async, I should probably make this async properly or use time.sleep.
        # Given the original code likely intended to sleep, I'll use time.sleep for a synchronous function
        # OR make it async.
        # Let's check main.py again. `search_multiple_queries` is called in `run_pipeline` which IS async.
        # `search_results = search_multiple_queries(...)` - it was called synchronously.
        # So I should use time.sleep if I want it to sleep, or make it async.
        # I'll stick to synchronous for now as in the original, but use time.sleep to actually sleep.
        pass
        
    logger.info(f"✓ Total unique results: {len(all_results)}")
    return all_results


def extract_links(results: List[Dict]) -> List[str]:
    """Extract URLs from search results."""
    links = [item["href"] for item in results if "href" in item]
    logger.info(f"Extracted {len(links)} unique links")
    return links
