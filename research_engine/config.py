import os
import logging
from dotenv import load_dotenv

load_dotenv()

# API Keys & URLs
OLLAMA_API_KEY = os.getenv('OLLAMA_API_KEY')
OLLAMA_HOST = "https://ollama.com"
MODEL_NAME = "nemotron-3-nano:30b-cloud"

# Scraper Settings
CONCURRENT_REQUESTS = 5
REQUEST_TIMEOUT = 10.0
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

# Search Settings
DEFAULT_SEARCH_RESULTS = 5
DEFAULT_EXPANSION_COUNT = 3

# Logging Configuration
def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger("ResearchEngine")

logger = setup_logging()