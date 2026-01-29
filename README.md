# Video Library Search Engine

A semantic video search engine with AI-powered analysis, chat, and 3-tier cascaded reranking. Includes a FastAPI backend and an Electron desktop app.

## Features

- **Semantic Video Search** — Natural language queries with dual embeddings (text + visual)
- **3-Tier Cascaded Reranking** — Hybrid RRF retrieval → LLM text reranking → multimodal reranking with frame verification
- **AI-Powered Analysis** — Automatic transcription (Whisper) + visual descriptions (Gemini)
- **Chat with Clips** — Multi-turn conversations about video clips using Gemini with context caching
- **Desktop App** — Native Electron + Vue 3 app with custom video player, library management, and settings

## Prerequisites

- **Python 3.10+** with [`uv`](https://docs.astral.sh/uv/) package manager
- **Node.js 18+** and [Bun](https://bun.sh) (for the desktop app)
- **FFmpeg** — `brew install ffmpeg` (macOS) or `apt-get install ffmpeg` (Linux)
- **Docker** (for Qdrant) or a [local Qdrant install](https://qdrant.tech/documentation/quick-start/)
- **Google Cloud Project** with Vertex AI API enabled
- **GCP Application Default Credentials**

## Local Setup

### 1. Clone and install Python dependencies

```bash
git clone <repo-url>
cd video-analyser
uv pip install -e .
```

### 2. Authenticate with Google Cloud

```bash
gcloud auth application-default login
```

### 3. Create `.env` in the project root

```env
# Google Cloud
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
GEMINI_MODEL=gemini-2.0-flash-exp

# Qdrant
QDRANT_HOST=localhost
QDRANT_PORT=6333

# Video Processing
CHUNK_DURATION_SECONDS=30
CHUNK_OVERLAP_SECONDS=5
FRAME_EXTRACTION_FPS=1

# Embeddings
EMBEDDING_MAX_WORKERS=5

# Cascaded Reranking
RERANKING_ENABLED=true
TIER1_CANDIDATES=50
TIER2_MODEL=gemini-2.0-flash-exp
TIER3_FRAMES_PER_CLIP=5
CONFIDENCE_THRESHOLD=0.8

# Storage (auto-created)
VIDEOS_DIR=./data/videos
FRAMES_DIR=./data/frames
METADATA_DIR=./data/metadata
```

### 4. Start Qdrant

```bash
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/data/qdrant_storage:/qdrant/storage \
    qdrant/qdrant
```

### 5. Start the backend

```bash
# Development (hot-reload)
python run.py

# Production
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

The API is available at `http://localhost:8000` with interactive docs at `/docs`.

### 6. Start the desktop app

```bash
cd desktop
bun install
bun run dev
```

The app connects to the backend at `http://localhost:8000`.

To build distributable binaries:

```bash
bun run dist        # current platform
bun run dist:mac    # macOS
bun run dist:win    # Windows
bun run dist:linux  # Linux
```

## API Usage

### Upload a video

```bash
curl -X POST "http://localhost:8000/videos/upload" \
  -F "file=@/path/to/video.mp4" \
  -F "title=My Video"
```

This automatically chunks the video, extracts frames, runs AI analysis (transcription + visual descriptions), generates dual embeddings, and indexes everything in Qdrant.

### Search videos

```bash
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "man flirts with a woman",
    "top_k": 5,
    "use_cascaded_reranking": true,
    "confidence_threshold": 0.8
  }'
```

### Chat with clips

```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "clip_ids": ["vid_123_0_30"],
    "query": "What happens in this clip?"
  }'
```

### List videos

```bash
curl "http://localhost:8000/videos"
```

## Project Structure

```
video-analyser/
├── src/                          # Backend (FastAPI)
│   ├── main.py                  # Application entry point
│   ├── core/                    # Config, constants, exceptions, logging
│   ├── models/                  # Pydantic models (video, search, chat)
│   ├── api/routes/              # REST endpoints
│   ├── video_processing/        # Chunking and frame extraction
│   ├── ai_analysis/             # Whisper transcription + Gemini vision
│   ├── embeddings/              # Dual embedding generation
│   ├── search/                  # Vector DB, reranker, search service
│   ├── chat/                    # Chat with context caching
│   └── utils/                   # Retry logic, prompt templates
├── desktop/                      # Desktop app (Electron + Vue 3 + TypeScript)
│   ├── src/main/                # Electron main process
│   ├── src/renderer/            # Vue app entry
│   ├── src/components/          # UI components (search, library, chat, settings, video)
│   ├── src/stores/              # Pinia state management
│   ├── src/views/               # Main views (Search, Library, Chat, Settings)
│   └── src/types/               # TypeScript type definitions
├── data/                         # Runtime data (gitignored)
│   ├── videos/                  # Uploaded videos
│   ├── frames/                  # Extracted frames
│   ├── metadata/                # JSON metadata
│   └── qdrant_storage/          # Vector database
├── prompts/                      # LLM prompt templates
├── tests/                        # Unit and integration tests
├── docs/                         # Architecture and planning docs
├── run.py                        # Dev server launcher
└── pyproject.toml               # Python project config
```

## How It Works

### Video Processing Pipeline

1. **Upload** — Video saved to `data/videos/`
2. **Chunking** — Split into 30s chunks with 5s overlap
3. **Frame Extraction** — 1 frame per second
4. **AI Analysis** — Whisper for audio transcription, Gemini for visual descriptions
5. **Embedding Generation** — Text embeddings (gemini-embedding-001, 3072-dim) + visual embeddings (multimodalembedding@001, 1408-dim) generated in parallel
6. **Indexing** — Stored in Qdrant with dual named vectors

### 3-Tier Cascaded Search

| Tier | Method | Output |
|------|--------|--------|
| 1 | Hybrid RRF (text + visual embedding search combined with Reciprocal Rank Fusion) | Top 50 candidates |
| 2 | LLM text-only reranking (Gemini Flash) | Top 5 candidates |
| 3 | Multimodal LLM reranking with frame verification | Final ranked results with confidence scores |

## Testing

```bash
python verify_imports.py   # Verify all imports
pytest tests/unit/         # Unit tests
pytest tests/integration/  # Integration tests (requires data)
pytest tests/              # All tests
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Import errors | Run `python verify_imports.py` |
| Qdrant connection failed | Ensure Qdrant is running on port 6333 |
| FFmpeg not found | `brew install ffmpeg` (macOS) or `apt-get install ffmpeg` (Linux) |
| Slow embedding generation | Increase `EMBEDDING_MAX_WORKERS` in `.env` |
| Low search precision | Enable cascaded reranking, adjust `CONFIDENCE_THRESHOLD` |
| Desktop blank screen | Open dev tools (View > Toggle Developer Tools) |

## Security

- `.env` is gitignored — never commit credentials
- GCP auth uses Application Default Credentials
- Qdrant runs on localhost only
- CORS restricted to localhost origins

## License

MIT
