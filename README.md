# Video Analyser Prototype

A simple application to chat with a video file using Gemini 1.5 Flash via Vertex AI.

## Prerequisites
1.  **Authentication:** Authenticate with Google Cloud using Application Default Credentials
2.  **GCS Bucket:** A Google Cloud Storage bucket to store video files (configured as `shandar-ai-videos`)
3.  **Video File:** A local `.mp4` or `.mov` file to analyze

## Setup Instructions
1.  **Authenticate with Google Cloud:**
    ```bash
    gcloud auth application-default login
    ```
    This creates credentials at `~/.config/gcloud/application_default_credentials.json`

2.  **Configure the App:**
    Edit `app.py` (lines 7-9) to set your configuration:
    ```python
    VIDEO_PATH = "./video.mp4"           # Path to your local video file
    GCS_BUCKET_NAME = "shandar-ai-videos"  # Your GCS bucket name
    GCS_BLOB_NAME = "videos/uploaded_video.mp4"  # Destination path in GCS
    ```

3.  **Run the App:**
    Using `uv`, you can run the app directly:
    ```bash
    uv run streamlit run app.py
    ```

## How it Works
- The app automatically uploads the video at `VIDEO_PATH` to Google Cloud Storage upon startup
- The GCS URI is then passed to Gemini 1.5 Flash via Vertex AI for analysis
- You can then type questions in the chat box to analyze visual or auditory content in the video

## Architecture
```
Local Video → Upload to GCS → Pass GCS URI to Gemini (Vertex AI) → Chat Interface
```

This approach is required when using Vertex AI, as it doesn't support direct file uploads like the Gemini Developer API.