import re
from typing import List, Dict
from ollama import Client
from config import logger, OLLAMA_HOST, OLLAMA_API_KEY, MODEL_NAME

def rerank_articles(articles: List[Dict], original_query: str, top_n: int = 5) -> List[Dict]:
    """
    Uses LLM to analyze the relevance of each article to the original query.
    Returns the top N most relevant articles.
    """
    if len(articles) <= top_n:
        logger.info(f"Article count ({len(articles)}) <= top_n ({top_n}). Skipping rerank.")
        return articles

    logger.info("=" * 60)
    logger.info("Reranking articles based on relevance...")
    logger.info("=" * 60)

    try:
        client = Client(
            host=OLLAMA_HOST,
            headers={'Authorization': 'Bearer ' + str(OLLAMA_API_KEY)}
        )

        # Create a condensed list for the LLM to evaluate
        # We only send title + first 300 chars to save tokens
        candidates_text = ""
        for i, a in enumerate(articles):
            snippet = a['text'][:300].replace('\n', ' ')
            candidates_text += f"ID {i}: Title: {a['title']} | Snippet: {snippet}...\n"

        prompt = (
            f"I have a list of articles retrieved for the query: '{original_query}'.\n"
            "Your task is to identify the most relevant and high-quality articles from this list.\n\n"
            f"CANDIDATES:\n{candidates_text}\n\n"
            f"INSTRUCTIONS:\n"
            f"- Select exactly {top_n} article IDs that are most relevant to the query.\n"
            "- Prioritize articles that seem factual, detailed, and directly address the topic.\n"
            "- Return ONLY a comma-separated list of IDs (e.g., '0, 3, 4, 1, 6').\n"
            "- Do not write any explanation.\n\n"
            "Relevant IDs:"
        )

        response = client.generate(
            model=MODEL_NAME,
            prompt=prompt,
            stream=False
        )

        response_text = response['response'].strip()
        logger.info(f"LLM Rerank Output: {response_text}")

        # Parse IDs from response
        # Find all numbers in the string
        selected_ids = [int(n) for n in re.findall(r'\d+', response_text)]

        # Validate IDs
        valid_ids = [uid for uid in selected_ids if 0 <= uid < len(articles)]

        # If LLM failed to return enough valid IDs, fallback to original order for the rest
        if not valid_ids:
            logger.warning("LLM returned no valid IDs. Falling back to original order.")
            return articles[:top_n]

        # Construct final list preserving the order of relevance determined by LLM
        ranked_articles = [articles[uid] for uid in valid_ids]

        # If we selected fewer than top_n (but > 0), fill up with remaining original articles
        if len(ranked_articles) < top_n:
            remaining = [a for i, a in enumerate(articles) if i not in valid_ids]
            ranked_articles.extend(remaining[:top_n - len(ranked_articles)])

        # Ensure we don't exceed top_n
        final_list = ranked_articles[:top_n]

        logger.info(f"✓ Reranked: Kept {len(final_list)} articles")
        return final_list

    except Exception as e:
        logger.error(f"Reranking failed: {e}")
        logger.info("Falling back to original list")
        return articles[:top_n]
