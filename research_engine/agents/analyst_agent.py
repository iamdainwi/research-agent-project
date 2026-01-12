from typing import List, Dict
from ollama import Client
from config import logger, OLLAMA_HOST, OLLAMA_API_KEY, MODEL_NAME


def _generate_prompt(articles: List[Dict], original_query: str) -> str:
    """Helper to generate the prompt for the LLM."""
    sources = []
    for i, a in enumerate(articles, 1):
        sources.append(
            f"[{i}] SOURCE {i}\n"
            f"    TITLE: {a['title']}\n"
            f"    URL: {a['url']}\n"
            f"    CONTENT:\n{a['text']}\n"
        )

    context = "\n\n".join(sources)
    references = "\n".join([f"[{i}] {a['url']}" for i, a in enumerate(articles, 1)])

    return (
        "You are a factual analyst tasked with synthesizing information from multiple sources.\n\n"
        f"ORIGINAL QUERY: '{original_query}'\n\n"
        "TASK:\n"
        "Analyze the provided web articles and create a comprehensive summary.\n\n"
        "CITATION REQUIREMENTS (CRITICAL):\n"
        "- Use inline citations in the format [1], [2], [3] etc.\n"
        "- Place a citation [N] immediately after EVERY fact or claim\n"
        "- Example: 'AI agents are evolving rapidly [1].'\n\n"
        "CONTENT REQUIREMENTS:\n"
        "- Only include information explicitly stated in the sources\n"
        "- If sources conflict, present both views\n"
        "- Use neutral, objective language\n\n"
        "FORMAT:\n"
        "1. Write 2-4 paragraphs summarizing key findings with inline [N] citations\n"
        "2. Blank line\n"
        "3. 'References:' section listing all sources\n\n"
        f"SOURCES:\n{context}\n\n"
        f"REFERENCE LIST:\n{references}\n\n"
        "Summary:"
    )


def llm_summary(articles: List[Dict], original_query: str) -> str:
    """Generate an AI summary with citations."""
    if not articles:
        return "No articles available for summary."

    logger.info(f"Generating summary from {len(articles)} articles...")

    try:
        client = Client(
            host=OLLAMA_HOST,
            headers={'Authorization': 'Bearer ' + str(OLLAMA_API_KEY)}
        )

        prompt = _generate_prompt(articles, original_query)
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


async def stream_llm_summary(articles: List[Dict], original_query: str):
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

        prompt = _generate_prompt(articles, original_query)
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
