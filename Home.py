"""
Video Library Search Engine - Home Page
Phase 3: Multi-page Streamlit application
"""
import streamlit as st
import os
from pathlib import Path

st.set_page_config(
    page_title="Video Library Search Engine",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("🎬 Video Library Search Engine")
st.markdown("### Semantic search across your video library using AI")

# Metrics Row
col1, col2, col3 = st.columns(3)

# Count videos in ./videos directory
videos_dir = Path("./videos")
video_count = len([f for f in videos_dir.glob("*.mp4")]) if videos_dir.exists() else 0

with col1:
    st.metric("📹 Videos Indexed", video_count)

with col2:
    st.metric("📦 Chunks Stored", "Backend not connected")

with col3:
    st.metric("🔍 Search Ready", "Backend not connected")

st.divider()

# Quick Start Guide
st.markdown("## 🚀 Quick Start")

st.markdown("""
This application allows you to build a searchable video library with AI-powered semantic search and chat capabilities.

### Features:

**1. 📚 Library Management**
- Upload videos to your library
- View all indexed videos with metadata
- Delete videos from the library

**2. 🔍 Semantic Search**
- Search across all videos using natural language
- Find specific scenes, topics, or moments
- Get ranked results with timestamps and thumbnails

**3. 💬 Chat with Clips**
- Select multiple video clips from search results
- Ask questions about the content
- Get answers with timestamp references

### Getting Started:

1. **Upload Videos**: Navigate to the Library page and upload your first video
2. **Wait for Processing**: Videos are chunked, transcribed, and indexed automatically
3. **Search**: Use natural language queries to find relevant moments
4. **Chat**: Select clips and ask questions about the content
""")

st.divider()

# System Status
st.markdown("## ⚙️ System Status")

col1, col2 = st.columns(2)

with col1:
    st.markdown("**Storage Locations:**")
    st.code(f"""
Videos: {os.getenv('VIDEOS_DIR', './videos')}
Frames: {os.getenv('FRAMES_DIR', './frames')}
Metadata: {os.getenv('METADATA_DIR', './metadata')}
    """)

with col2:
    st.markdown("**Configuration:**")
    st.code(f"""
Chunk Duration: {os.getenv('CHUNK_DURATION_SECONDS', '60')}s
Chunk Overlap: {os.getenv('CHUNK_OVERLAP_SECONDS', '10')}s
Frame Extraction: {os.getenv('FRAME_EXTRACTION_FPS', '1')} FPS
    """)

st.info("💡 **Note**: Backend API is not yet connected. Upload and search features will display placeholder messages until Phase 3.4+ is complete.")
