"""
Library Management Page
Upload, view, and manage videos in the library
"""
import streamlit as st
from pathlib import Path
import os

st.set_page_config(
    page_title="Library - Video Search",
    page_icon="📚",
    layout="wide"
)

st.title("📚 Video Library")

# Upload Section
st.markdown("## Upload Video")

with st.form("upload_form"):
    st.markdown("Upload a new video to your library")

    video_title = st.text_input(
        "Video Title",
        placeholder="Enter a descriptive title for your video",
        help="This will help you identify the video in search results"
    )

    uploaded_file = st.file_uploader(
        "Choose a video file",
        type=["mp4", "mov", "avi"],
        help="Supported formats: MP4, MOV, AVI"
    )

    submit_button = st.form_submit_button("Upload and Process", type="primary")

    if submit_button:
        if not video_title:
            st.error("Please enter a video title")
        elif not uploaded_file:
            st.error("Please select a video file")
        else:
            # For now, just save to ./videos directory
            # Backend processing will be added in Phase 3.5+
            videos_dir = Path("./videos")
            videos_dir.mkdir(exist_ok=True)

            video_path = videos_dir / uploaded_file.name

            with st.spinner("Saving video..."):
                with open(video_path, "wb") as f:
                    f.write(uploaded_file.getbuffer())

            st.success(f"✅ Video saved to {video_path}")
            st.warning("⚠️ Backend not connected yet - video will not be processed automatically. Processing (chunking, transcription, indexing) will be added in Phase 3.5+")
            st.info(f"📝 Title: {video_title}")
            st.info(f"📁 Saved as: {uploaded_file.name}")

st.divider()

# Library View Section
st.markdown("## Video Library")

videos_dir = Path("./videos")

if not videos_dir.exists():
    st.info("No videos directory found. Upload your first video to get started!")
else:
    video_files = list(videos_dir.glob("*.mp4")) + list(videos_dir.glob("*.mov")) + list(videos_dir.glob("*.avi"))

    if not video_files:
        st.info("No videos in library yet. Upload your first video above!")
    else:
        st.markdown(f"**{len(video_files)} video(s) in library**")

        # Display video list
        for video_file in sorted(video_files):
            with st.expander(f"📹 {video_file.name}"):
                col1, col2 = st.columns([3, 1])

                with col1:
                    st.markdown(f"**File:** `{video_file.name}`")
                    st.markdown(f"**Path:** `{video_file}`")

                    # Get file size
                    file_size_mb = video_file.stat().st_size / (1024 * 1024)
                    st.markdown(f"**Size:** {file_size_mb:.2f} MB")

                    st.markdown("**Status:** ⚠️ Not indexed (backend not connected)")

                with col2:
                    if st.button("Delete", key=f"delete_{video_file.name}"):
                        try:
                            video_file.unlink()
                            st.success(f"Deleted {video_file.name}")
                            st.rerun()
                        except Exception as e:
                            st.error(f"Error deleting file: {e}")

st.divider()

st.markdown("### 📋 Next Steps")
st.info("""
**Phase 3.4+**: Backend API will be connected to:
- Process uploaded videos automatically
- Extract chunks, frames, transcriptions
- Generate embeddings and store in Qdrant
- Show indexing status and metadata
""")
