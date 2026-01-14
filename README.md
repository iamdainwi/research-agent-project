<p  align="center">

<img  src="frontend/public/logo.svg"  alt="Research Agent Logo"  width="80"  height="80"  />

</p>

  

<h1  align="center">🔬 Research Agent</h1>

  

<p  align="center">

<strong>An AI-Powered Deep Research Engine with Real-Time Web Analysis</strong>

</p>

  

<p  align="center">

<em>Transform any query into comprehensive, citation-backed research summaries using advanced LLM-powered agents</em>

</p>

  

<p  align="center">

<img  src="https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white"  alt="Python"  />

<img  src="https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js&logoColor=white"  alt="Next.js"  />

<img  src="https://img.shields.io/badge/FastAPI-0.128.0-009688?style=for-the-badge&logo=fastapi&logoColor=white"  alt="FastAPI"  />

<img  src="https://img.shields.io/badge/Ollama-LLM-FF6F00?style=for-the-badge"  alt="Ollama"  />

</p>

  

---

  

## 📖 Table of Contents

  

- [Overview](#-overview)

- [Key Features](#-key-features)

- [Architecture](#-architecture)

- [How It Works](#-how-it-works)

- [Tech Stack](#-tech-stack)

- [Getting Started](#-getting-started)

- [Usage](#-usage)

- [API Reference](#-api-reference)

- [Project Structure](#-project-structure)

- [Future Roadmap](#-future-roadmap)

- [Contributing](#-contributing)

- [License](#-license)

  

---

  

## 🌟 Overview

  

**Research Agent** is a sophisticated, open-source research automation platform that combines the power of Large Language Models (LLMs) with real-time web scraping to produce comprehensive, well-cited research summaries. Think of it as your personal AI research assistant that can explore any topic in depth, synthesize information from multiple sources, and deliver professional-grade research reports—all in real-time with a beautiful, Perplexity-inspired user interface.

  

The system employs a multi-agent architecture where specialized AI agents handle different aspects of the research pipeline:

  

-  **Query Expansion Agent** - Generates semantically diverse search queries

-  **Search Agent** - Aggregates results from multiple web sources

-  **Ranker Agent** - Uses LLM to select the most relevant articles

-  **Analyst Agent** - Synthesizes findings into citation-backed summaries

  

This project was built to democratize access to powerful research capabilities, enabling anyone to conduct thorough research on any topic without needing specialized skills or expensive tools.

  

---

  

## ✨ Key Features


### 🧠 Intelligent Query Expansion
The system doesn't just search for what you type—it understands the intent behind your query and generates multiple related search terms to ensure comprehensive coverage of the topic.

  
### 🌐 Multi-Source Web Aggregation
Searches across the web using DuckDuckGo's API, collecting results from diverse sources to avoid bias and ensure well-rounded research.

  
### 🔄 Smart Deduplication
Automatically detects and removes duplicate content using MD5 fingerprinting, ensuring you get unique, valuable information without redundancy.

  
### 📊 LLM-Powered Relevance Ranking
Uses AI to analyze and rank articles based on their relevance to your query, filtering out low-quality or tangential content.

  
### 📝 Citation-Backed Summaries
Generates detailed summaries with inline citations `[1]`, `[2]`, etc., linking every claim back to its source for verification and credibility.

  
### ⚡ Real-Time Streaming
Experience research in real-time with Server-Sent Events (SSE) streaming. Watch as the AI expands queries, fetches pages, and generates summaries—all with live progress updates.

  
### 🎨 Beautiful Modern UI

A sleek, dark-mode interface inspired by Perplexity AI, featuring:
- Animated thinking process visualization
- Interactive source cards with favicons
- Markdown-rendered responses with syntax highlighting
- Responsive design for all devices

  

### 🔧 Dual Mode Operation
-  **CLI Mode**: Perfect for quick terminal-based research and automation
-  **API Server**: Production-ready FastAPI server for integration into other applications

  

---

## 🏗️ Architecture

```

┌─────────────────────────────────────────────────────────────────────────────┐

│ Research Agent │

├─────────────────────────────────────────────────────────────────────────────┤

│ │

│ ┌───────────────────────────────────────────────────────────────────────┐ │

│ │ Frontend (Next.js 16) │ │

│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │

│ │ │ Search │ │ Thinking │ │ Sources │ │ Answer │ │ │

│ │ │ Input │ │ Process │ │ Grid │ │ Renderer │ │ │

│ │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │ │

│ └───────────────────────────────────────────────────────────────────────┘ │

│ │ │

│ │ SSE Stream │

│ ▼ │

│ ┌───────────────────────────────────────────────────────────────────────┐ │

│ │ Research Engine (Python/FastAPI) │ │

│ │ ┌─────────────────────────────────────────────────────────────────┐ │ │

│ │ │ Research Pipeline │ │ │

│ │ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐ │ │ │

│ │ │ │ Query │→ │ Search │→ │ Scraper │→ │ Ranker │→ │Analyst│ │ │ │

│ │ │ │Expansion│ │ Agent │ │ │ │ Agent │ │ Agent │ │ │ │

│ │ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────┘ │ │ │

│ │ └─────────────────────────────────────────────────────────────────┘ │ │

│ └───────────────────────────────────────────────────────────────────────┘ │

│ │ │

│ ▼ │

│ ┌───────────────────────────────────────────────────────────────────────┐ │

│ │ External Services │ │

│ │ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │ │

│ │ │ Ollama LLM │ │ DuckDuckGo │ │ Web Pages │ │ │

│ │ │ (nemotron-3) │ │ Search API │ │ (HTTP/HTTPX) │ │ │

│ │ └─────────────────┘ └─────────────────┘ └─────────────────┘ │ │

│ └───────────────────────────────────────────────────────────────────────┘ │

│ │

└─────────────────────────────────────────────────────────────────────────────┘

```

  

---

  

## 🔄 How It Works
The Research Agent operates through a sophisticated multi-stage pipeline that transforms user queries into comprehensive research reports:

  

### Stage 1: Query Expansion 🔍
When you submit a query like *"Future of AI agents in 2026"*, the system doesn't just perform a single search. Instead, it uses an LLM to generate semantically related queries:

  
```

Original: "Future of AI agents in 2026"

Expanded:

→ "AI agent technology trends 2026"

→ "Autonomous AI systems development roadmap"

→ "Machine learning agents next generation"

→ "Artificial intelligence automation future"

```

  

This ensures broader coverage and discovers information that a single query might miss.

  

### Stage 2: Web Search & Aggregation 🌐

  

The expanded queries are sent to DuckDuckGo's search API. Results are:

- Aggregated from all queries

- Deduplicated by URL to avoid fetching the same page multiple times

- Typically yields 15-30 unique sources per research session

  

### Stage 3: Concurrent Page Fetching ⚡

  

Using `httpx` with HTTP/2 support, pages are fetched concurrently with:

- Connection pooling for efficiency

- Semaphore-controlled concurrency (default: 5 simultaneous requests)

- Configurable timeouts to handle slow servers gracefully

- Automatic redirect following

  

### Stage 4: Content Extraction 📄

  

Raw HTML is processed using:

-  **Readability-lxml**: Mozilla's Readability algorithm to extract main article content

-  **BeautifulSoup**: For clean text extraction from HTML

- Automatic cleaning of NULL bytes and control characters

- Articles under 100 characters are filtered out as low-quality

  

### Stage 5: Deduplication 🔁

  

Content is fingerprinted using MD5 hashing to identify and remove duplicates that might have different URLs but identical content.

  

### Stage 6: LLM-Powered Ranking 📊

  

The Ranker Agent evaluates each article's relevance to the original query:

- Sends article titles and snippets to the LLM

- LLM selects the top N most relevant articles (default: 5)

- Ensures only the most pertinent information makes it to the final summary

  

### Stage 7: Summary Generation 📝

  

The Analyst Agent synthesizes all gathered information:

- Creates a comprehensive prompt with all source content

- Generates a detailed summary with inline citations `[1]`, `[2]`, etc.

- Streams tokens in real-time for immediate feedback

- Includes a references section at the end

  

---

  

## 🛠️ Tech Stack

  

### Backend (Research Engine)

  

| Technology | Purpose |

|------------|---------|

| **Python 3.9+** | Core runtime |

| **FastAPI** | High-performance async web framework |

| **Uvicorn** | ASGI server for production deployment |

| **Ollama** | Local LLM inference (nemotron-3-nano:30b-cloud) |

| **HTTPX** | Async HTTP client with HTTP/2 support |

| **BeautifulSoup** | HTML parsing and content extraction |

| **Readability-lxml** | Main content extraction using Mozilla's algorithm |

| **DuckDuckGo Search** | Web search API integration |

| **python-dotenv** | Environment configuration |

| **uv** | Fast Python package manager |

  

### Frontend

  

| Technology | Purpose |

|------------|---------|

| **Next.js 16.1.1** | React framework with App Router |

| **React 19** | UI component library |

| **TypeScript** | Type-safe JavaScript |

| **Tailwind CSS 4** | Utility-first CSS framework |

| **Radix UI** | Accessible component primitives |

| **Lucide React** | Beautiful icon library |

| **React Markdown** | Markdown rendering with plugins |

| **pnpm** | Fast, disk-efficient package manager |

  

---

  

## 🚀 Getting Started

  

### Prerequisites

  

-  **Python 3.9+** installed

-  **Node.js 18+** and **pnpm** for the frontend

-  **Ollama** installed and running locally ([Download Ollama](https://ollama.com/))

  

### 1. Clone the Repository

  

```bash

git  clone  https://github.com/iamdanwi/research-agent-project.git

cd  research-agent-project

```

  

### 2. Set Up the Research Engine (Backend)

  

```bash

cd  research_engine

  

# Install dependencies using uv (recommended)

uv  sync

  

# OR using pip

pip  install  -r  requirements.txt

```

  

#### Configure Environment

  

Create a `.env` file in the `research_engine` directory:

  

```env

OLLAMA_API_KEY=your_key_if_needed

```

  

#### Pull the LLM Model

  

```bash

ollama  pull  nemotron-3-nano:30b-cloud

```

  

### 3. Set Up the Frontend

  

```bash

cd  ../frontend

  

# Install dependencies

pnpm  install

```

  

### 4. Start the Services

  

**Terminal 1 - Start the Research Engine:**

```bash

cd  research_engine

python  server.py

# Server runs on http://localhost:8000

```

  

**Terminal 2 - Start the Frontend:**

```bash

cd  frontend

pnpm  dev

# Frontend runs on http://localhost:3000

```

  

### 5. Open in Browser

  

Navigate to `http://localhost:3000` and start researching!

  

---

  

## 📖 Usage

  

### Web Interface

  

1. Open the application in your browser

2. Type your research query in the search box

3. Press Enter or click the submit button

4. Watch the real-time research process:

- Query expansion

- Web searching

- Page fetching

- Content processing

- Summary generation

5. Review the sources and citation-backed summary

  

### CLI Mode

  

For quick terminal-based research:

  

```bash

cd  research_engine

python  main.py

```

  

Follow the prompts to enter your query. The summary can be saved to a text file.

  

---

  

## 📡 API Reference

  

### POST `/api/research`

  

Initiates a research session and returns a Server-Sent Events stream.

  

**Request Body:**

```json

{

"query": "Your research topic",

"max_results": 5,

"expand_count": 3

}

```

  

**Parameters:**

| Parameter | Type | Default | Description |

|-----------|------|---------|-------------|

| `query` | string | required | The research topic to explore |

| `max_results` | integer | 5 | Number of search results per query |

| `expand_count` | integer | 3 | Number of query expansions to generate |

  

**Response (SSE Stream):**

  

```

event: status

data: "Expanding queries..."

  

event: log

data: "Expansions: [\"query1\", \"query2\", \"query3\"]"

  

event: status

data: "Searching web for 4 queries..."

  

event: sources

data: [{"title": "...", "url": "...", "text": "..."}]

  

event: status

data: "Generating summary..."

  

event: token

data: "The future of AI agents..."

  

event: done

data: "Research complete."

```

  

**Event Types:**

| Event | Description |

|-------|-------------|

| `status` | Current pipeline stage (for UI progress indicators) |

| `log` | Detailed debug information (counts, expansions, etc.) |

| `sources` | Array of selected articles with metadata |

| `token` | Individual tokens for streaming summary display |

| `error` | Error message if pipeline fails |

| `done` | Completion signal |

  

---

  

## 📁 Project Structure

  

```

research-agent-project/

├── README.md # This file

├── .gitignore

│

├── frontend/ # Next.js Frontend Application

│ ├── src/

│ │ ├── app/

│ │ │ ├── api/ # API routes (proxy to backend)

│ │ │ ├── layout.tsx # Root layout

│ │ │ ├── page.tsx # Home page

│ │ │ └── globals.css # Global styles

│ │ ├── components/

│ │ │ ├── ResearchChat.tsx # Main chat interface

│ │ │ └── ui/ # Reusable UI components

│ │ └── lib/

│ │ └── utils.ts # Utility functions

│ ├── public/ # Static assets

│ ├── package.json

│ └── tailwind.config.ts

│

└── research_engine/ # Python Backend (FastAPI)

├── agents/ # AI Agent implementations

│ ├── __init__.py

│ ├── search_agent.py # Query expansion & web search

│ ├── ranker_agent.py # LLM-based relevance ranking

│ ├── analyst_agent.py # Summary generation

│ └── workflow.py # Pipeline orchestration

├── utils/ # Helper utilities

│ ├── scraper.py # Concurrent page fetching

│ └── text_process.py # HTML extraction & deduplication

├── config.py # Configuration & settings

├── server.py # FastAPI application

├── main.py # CLI entry point

├── pyproject.toml # Python dependencies

└── .env # Environment variables

```

  

---

  

## 🔮 Future Roadmap

  

We have exciting plans to enhance Research Agent with powerful new capabilities:

  

### 🚧 Short-Term (Q1 2026)

  

- [ ] **Multi-Model Support**: Switch between different LLMs (GPT-4, Claude, Gemini, local models)

- [ ] **Conversation History**: Persistent chat history with follow-up questions

- [ ] **Export Options**: Export research as PDF, Markdown, or DOCX

- [ ] **Source Caching**: Cache fetched pages to speed up repeated queries

- [ ] **User Authentication**: Secure user accounts with research history

  

### 🌟 Medium-Term (Q2-Q3 2026)

  

- [ ] **Advanced Web Scraping**: Selenium integration for JavaScript-heavy sites

- [ ] **Knowledge Graph**: Visual representation of research connections

- [ ] **Collaborative Research**: Share research sessions with team members

- [ ] **Custom Source Domains**: Restrict or prioritize specific websites

- [ ] **Academic Paper Integration**: ArXiv, Google Scholar, PubMed integration

- [ ] **Browser Extension**: Research any page directly from your browser

  

### 🚀 Long-Term Vision

  

- [ ] **Autonomous Research Agents**: Agents that proactively update research over time

- [ ] **Multi-Modal Research**: Image, video, and audio content analysis

- [ ] **Custom Agent Training**: Fine-tune agents for specific domains (medical, legal, technical)

- [ ] **Real-Time Collaboration**: Multiple users researching simultaneously

- [ ] **API Marketplace**: Community-built research plugins and integrations

- [ ] **Enterprise Features**: SSO, audit logs, compliance tools

  

### 💡 Ideas Under Consideration

  

- Voice-based research queries

- Mobile native applications (iOS/Android)

- Integration with note-taking apps (Notion, Obsidian)

- Research scheduling and alerts

- Fact-checking and bias detection

- Multi-language support

  

---

  

## 🤝 Contributing

  

We welcome contributions from the community! Here's how you can help:

  

### Ways to Contribute

  

1.  **Report Bugs**: Open an issue describing the bug and steps to reproduce

2.  **Suggest Features**: Share ideas for new features or improvements

3.  **Submit Pull Requests**: Fix bugs or implement new features

4.  **Improve Documentation**: Help make our docs clearer and more comprehensive

5.  **Share Feedback**: Tell us about your experience using Research Agent

  

### Development Setup

  

1. Fork the repository

2. Create a feature branch: `git checkout -b feature/amazing-feature`

3. Make your changes

4. Run tests (coming soon)

5. Commit your changes: `git commit -m 'Add amazing feature'`

6. Push to the branch: `git push origin feature/amazing-feature`

7. Open a Pull Request

  

### Code Style

  

-  **Python**: Follow PEP 8 guidelines

-  **TypeScript/React**: Use ESLint and Prettier configurations provided

-  **Commits**: Use conventional commit messages

  

---

  

## 📄 License

  

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

  

---

  

## 🙏 Acknowledgments

  

-  **Ollama** for making local LLM inference accessible

-  **DuckDuckGo** for their free search API

-  **Mozilla Readability** for the content extraction algorithm

-  **Perplexity AI** for UI/UX inspiration

- The open-source community for the amazing tools and libraries

  

---

  

<p  align="center">

<strong>Built with ❤️ for researchers, developers, and curious minds everywhere</strong>

</p>

  

<p  align="center">

<a  href="https://github.com/yourusername/research-agent-project">⭐ Star us on GitHub</a> •

<a  href="https://github.com/yourusername/research-agent-project/issues">🐛 Report Bug</a> •

<a  href="https://github.com/yourusername/research-agent-project/issues">✨ Request Feature</a>

</p>