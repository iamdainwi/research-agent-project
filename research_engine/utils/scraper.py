import asyncio
import httpx
from typing import List, Dict, Optional
from config import logger, CONCURRENT_REQUESTS, REQUEST_TIMEOUT, USER_AGENT

async def fetch_pages(links: List[str]) -> List[Dict]:
    """Fetch HTML content from URLs concurrently using httpx."""
    if not links:
        return []
        
    pages = []
    headers = {
        'User-Agent': USER_AGENT
    }

    # Limit concurrent requests
    semaphore = asyncio.Semaphore(CONCURRENT_REQUESTS)

    async def fetch(client, url, index):
        async with semaphore:
            try:
                logger.info(f"Fetching [{index}/{len(links)}]: {url}")
                response = await client.get(
                    url,
                    headers=headers,
                    timeout=8.0,
                    follow_redirects=True
                )

                if response.status_code == 200:
                    logger.info(f"✓ Successfully fetched {url}")
                    return {"url": url, "html": response.text}
                else:
                    return None
            except (httpx.TimeoutException, httpx.RequestError):
                return None  # skip failed pages silently
            except Exception:
                return None

    # Use connection pooling
    async with httpx.AsyncClient(http2=True) as client:
        tasks = [fetch(client, url, i) for i, url in enumerate(links, 1)]
        results = await asyncio.gather(*tasks)

    # Filter out None results
    pages = [res for res in results if res is not None]

    logger.info(f"Successfully fetched {len(pages)}/{len(links)} pages")
    return pages