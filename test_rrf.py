#!/usr/bin/env python3
"""
Test script to verify RRF implementation
"""

from embeddings import search_videos

# Test query: "man flirts with a woman"
# This should now use RRF with tier1_candidates=50
print("Testing RRF implementation...")
print("=" * 60)
print("Query: 'man flirts with a woman'")
print("=" * 60)

results = search_videos(
    query="man flirts with a woman",
    top_k=5,
    tier1_candidates=50  # Fetch Top 50, then rank with RRF
)

print(f"\nFound {len(results)} results:\n")

for i, result in enumerate(results, 1):
    print(f"{i}. [{result.chunk_id}] Score: {result.score:.4f}")
    print(f"   Video: {result.video_id}")
    print(f"   Time: {result.start_time}s - {result.end_time}s")
    print(f"   Visual: {result.visual_description[:100]}...")
    print(f"   Audio: {result.audio_transcript[:100]}...")
    print()

print("=" * 60)
print("RRF Test Complete!")
print("=" * 60)
