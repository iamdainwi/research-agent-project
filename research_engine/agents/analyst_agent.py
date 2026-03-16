from typing import List, Dict
from ollama import Client
from config import logger, OLLAMA_HOST, OLLAMA_API_KEY, MODEL_NAME


ANALYST_PROMPT = """You are a precise research analyst. Based on the sources below, write a comprehensive, well-structured answer.

STRICT RULES:
- Use inline citations [1], [2] immediately after EVERY factual claim
- Never state a fact without a citation
- If sources contradict each other, mention it explicitly
- Write in clear paragraphs with a logical flow
- End with a ## Sources section listing all cited URLs
- If the sources don't cover something, say so — never hallucinate

Sources:
{sources}

Question: {query}

Write your answer now:"""

def _generate_prompt(articles: List[Dict], original_query: str, history: list = None) -> str:
    """Helper to generate the prompt for the LLM."""
    sources = []
    for i, a in enumerate(articles, 1):
        sources.append(
            f"[{i}] SOURCE {i}\n"
            f"    TITLE: {a['title']}\n"
            f"    URL: {a['url']}\n"
            f"    CONTENT:\n{a['text']}\n"
        )
    
    sources_text = "\n\n".join(sources)
    prompt_str = ANALYST_PROMPT.format(sources=sources_text, query=original_query)
    
    if history:
        context = "\n".join([f"Previous Q: {h['query']}\nPrevious A: {h['response'][:200]}..." 
                             for h in history[-2:]])  # last 2 exchanges
        prompt_str = f"Previous conversation context:\n{context}\n\n{prompt_str}"
        
    return prompt_str


def llm_summary(articles: List[Dict], original_query: str, history: list = None) -> str:
    """Generate an AI summary with citations."""
    if not articles:
        return "No articles available for summary."

    logger.info(f"Generating summary from {len(articles)} articles...")

    try:
        client = Client(
            host=OLLAMA_HOST,
            headers={'Authorization': 'Bearer ' + str(OLLAMA_API_KEY)}
        )

        prompt = _generate_prompt(articles, original_query, history)
        messages = [{"role": "user", "content": prompt}]

        print("\n" + "=" * 60)
        print("SUMMARY:")
        print("=" * 60 + "\n")

        output = []
        for part in client.chat(
                model=MODEL_NAME,
                messages=messages,
                stream=True,
        ):
            token = part["message"]["content"]
            output.append(token)
            print(token, end="", flush=True)

        print("\n" + "=" * 60 + "\n")
        return "".join(output)

    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        return f"Error generating summary: {e}"


async def stream_llm_summary(articles: List[Dict], original_query: str, history: list = None):
    """Generate an AI summary with citations, yielding chunks."""
    if not articles:
        yield "No articles available for summary."
        return

    logger.info(f"Generating summary from {len(articles)} articles...")

    try:
        client = Client(
            host=OLLAMA_HOST,
            headers={'Authorization': 'Bearer ' + str(OLLAMA_API_KEY)}
        )

        prompt = _generate_prompt(articles, original_query, history)
        messages = [{"role": "user", "content": prompt}]

        for part in client.chat(
                model=MODEL_NAME,
                messages=messages,
                stream=True,
        ):
            token = part["message"]["content"]
            yield token

    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        yield f"Error generating summary: {e}"
