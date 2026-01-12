# AI Research Engine

An advanced, automated research pipeline that performs deep-dive topics exploration using AI agents. It effectively combines query expansion, multi-source web scraping, deduplication, content reranking, and LLM-based summarization to produce high-quality research reports.

## Features
- **Query Expansion**: Uses LLM to generate diverse search terms for broader coverage.
- **Deep Web Search**: Aggregates results from multiple sub-queries.
- **Intelligent Processing**: Cleans HTML, removes duplicates, and filters content.
- **Relevance Reranking**: Uses LLM to select the most pertinent articles.
- **Citation-Backed Summary**: Generates detailed summaries with inline citations linked to sources.
- **Dual Mode**: Run as a CLI tool or a high-performance streaming API server.

## Prerequisites
- **Python 3.9+**
- **Ollama**: You need [Ollama](https://ollama.com/) installed and running locally.
  - Pull the model used (default: `nemotron-3-nano:30b-cloud` or change in config):
    ```bash
    ollama pull nemotron-3-nano:30b-cloud
    ```

## Installation

This project uses `uv` for minimal and fast dependency management, but standard `pip` works too.

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd research_engine
   ```

2. **Install Dependencies**
   
   Using `uv` (Recommended):
   ```bash
   uv sync
   ```
   
   Using standard `pip`:
   ```bash
   pip install -r requirements.txt
   # OR installing manually if requirements.txt is not yet generated
   pip install fastapi uvicorn requests bs4 ddgs httpx ollama python-dotenv readability-lxml
   ```

3. **Configuration**
   Create a `.env` file in the root directory:
   ```env
   # .env
   OLLAMA_API_KEY=your_key_if_needed
   # If using local ollama without auth, key can be left empty or dummy
   ```
   
   You can adjust settings in `config.py` (Model name, timeouts, etc.).

## Usage

### 1. CLI Mode
Run the interactive command-line interface:
```bash
python main.py
```
- Enter your research query when prompted.
- The agent will log its progress and print the final summary.
- You can opt to save the summary to a text file.

### 2. API Server
Start the FastAPI server with streaming support:
```bash
python server.py
# OR
uvicorn server:app --reload
```

The server runs on `http://localhost:8000`.

#### API Endpoint
**POST** `/api/research`

**Body:**
```json
{
  "query": "Future of AI Agents",
  "max_results": 3,
  "expand_count": 3
}
```

**Response:**
The server returns a **Server-Sent Events (SSE)** stream.
- `event: status` -> Progress updates.
- `event: log` -> Debug logs (found links, extraction counts).
- `event: result` -> JSON object of the top articles found (before summary).
- `event: token` -> Streaming tokens of the generated summary.
- `event: done` -> Completion signal.

## Project Structure
- `agents/`: specialized agents for search, ranking, and analysis.
- `utils/`: helper scripts for scraping and text processing.
- `server.py`: FastAPI application entry point.
- `main.py`: CLI application entry point.
- `config.py`: Centralized configuration.
