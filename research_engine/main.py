import asyncio
from config import logger, DEFAULT_SEARCH_RESULTS, DEFAULT_EXPANSION_COUNT
from agents.analyst_agent import llm_summary
from agents.workflow import run_research_pipeline

async def main():
    try:
        print("=" * 60)
        print("AI RESEARCH ENGINE: EXPANSION + RERANKING")
        print("=" * 60)

        # Input handling
        query = input("\nEnter search query (or press Enter for default): ").strip()
        if not query:
            query = "future of ai agents in 2026"

        final_articles = []

        # Run Pipeline
        async for event in run_research_pipeline(
            query,
            max_results=DEFAULT_SEARCH_RESULTS,
            expand_count=DEFAULT_EXPANSION_COUNT
        ):
            if event["type"] == "result":
                final_articles = event["data"]
            elif event["type"] == "error":
                logger.error(event["data"])
                return
            else:
                # Log status and log events to console
                logger.info(f"{event['type'].upper()}: {event['data']}")

        if final_articles:
            print("\n" + "=" * 60)
            print(f"Pipeline complete: {len(final_articles)} high-quality articles ready")
            print("=" * 60 + "\n")

            summary = llm_summary(final_articles, query)

            save = input("\nSave summary to file? (y/n): ").strip().lower()
            if save == 'y':
                filename = f"summary_{query.replace(' ', '_')[:30]}.txt"
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(f"Query: {query}\n\n")
                    f.write(summary)
                logger.info(f"✓ Saved to {filename}")
        else:
            logger.error("No articles found.")

    except KeyboardInterrupt:
        logger.info("\n⚠ Interrupted")
    except Exception as e:
        logger.error(f"❌ Error: {e}", exc_info=True)


if __name__ == "__main__":
    asyncio.run(main())