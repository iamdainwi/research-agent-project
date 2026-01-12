import re
import hashlib
from typing import List, Dict
from bs4 import BeautifulSoup
from readability import Document
from config import logger

def clean_html(html: str) -> str:
    """Remove NULL bytes and control characters from HTML."""
    return re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F]', '', html)


def extract_articles(pages: List[Dict]) -> List[Dict]:
    """Extract clean article text from HTML pages."""
    articles = []

    for i, page in enumerate(pages, 1):
        try:
            logger.info(f"Extracting article [{i}/{len(pages)}]: {page['url']}")

            cleaned_html = clean_html(page["html"])
            doc = Document(cleaned_html)
            soup = BeautifulSoup(doc.summary(html_partial=True), "html.parser")
            text = soup.get_text("\n", strip=True)

            if text and len(text) > 100:
                articles.append({
                    "url": page["url"],
                    "title": doc.title(),
                    "text": text[:15000]  # Increased limit slightly
                })
                logger.info(f"✓ Extracted: {doc.title()} ({len(text)} chars)")
            else:
                logger.warning(f"✗ Insufficient content from {page['url']}")

        except ValueError:
            logger.warning(f"✗ XML parsing error for {page['url']}")
        except Exception as e:
            logger.warning(f"✗ Extraction failed for {page['url']}: {type(e).__name__}")

    logger.info(f"Successfully extracted {len(articles)}/{len(pages)} articles")
    return articles


def deduplicate(articles: List[Dict]) -> List[Dict]:
    """Remove duplicate articles based on content hash."""
    seen = set()
    unique = []

    for article in articles:
        fingerprint = hashlib.md5(article["text"].encode("utf-8")).hexdigest()
        if fingerprint not in seen:
            seen.add(fingerprint)
            unique.append(article)
        else:
            logger.info(f"Removed duplicate: {article['title']}")

    logger.info(f"Deduplicated: {len(unique)}/{len(articles)} unique articles")
    return unique
