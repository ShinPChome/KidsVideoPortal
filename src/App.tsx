import { useEffect, useState } from "react";
import { Navigation } from "./components/Navigation";
import { VideoThumbnail } from "./components/VideoThumbnail";
import VideoPlayer from "./components/VideoPlayer";
import { PlayfulBackground } from "./components/PlayfulBackground";
import { motion } from "motion/react";
import { rawVideos } from "./data/videos";

/** ---------------- Types ---------------- */
type RawVideo = {
  youtubeId: string;
  // Optional preset title; if omitted, we'll use API title
  title?: string;
};

type Video = {
  id: string; // youtubeId
  title: string;
  duration: string; // formatted hh:mm:ss or m:ss
  thumbnail: string; // derived from youtubeId or API
  rating?: number;
};

/** ---------------- Config ----------------
 * Put your API key in .env
 * - Vite:             VITE_YT_API_KEY=xxxx
 * - Create React App: REACT_APP_YT_API_KEY=xxxx
 */
const YT_API_KEY = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_YT_API_KEY) || (typeof process !== "undefined" && (process as any).env?.REACT_APP_YT_API_KEY) || "";

/** ---------------- Helpers ---------------- */
const chunk = <T,>(arr: T[], size: number) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

function iso8601ToHHMMSS(iso: string) {
  // PT#H#M#S
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const h = m?.[1] ? parseInt(m[1], 10) : 0;
  const mm = m?.[2] ? parseInt(m[2], 10) : 0;
  const ss = m?.[3] ? parseInt(m[3], 10) : 0;
  const mmStr = h > 0 ? String(mm).padStart(2, "0") : String(mm);
  const ssStr = String(ss).padStart(2, "0");
  return h > 0 ? `${h}:${mmStr}:${ssStr}` : `${mm}:${ssStr}`;
}

function deriveThumb(id: string) {
  // No API needed for preview image
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/** Batch fetch titles + durations from YouTube Data API v3 */
async function fetchVideosInfo(ids: string[]): Promise<Pick<Video, "id" | "title" | "duration" | "thumbnail">[]> {
  // If no API key, still return minimal info (thumbs only, blank duration)
  if (!YT_API_KEY) {
    return ids.map((id) => ({
      id,
      title: "", // will be filled from rawVideos title if available
      duration: "", // unknown without API
      thumbnail: deriveThumb(id),
    }));
  }

  const idChunks = chunk(ids, 50); // API limit
  const results: Pick<Video, "id" | "title" | "duration" | "thumbnail">[] = [];

  for (const group of idChunks) {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("id", group.join(","));
    url.searchParams.set("key", YT_API_KEY);
    // Optional: limit fields
    // url.searchParams.set("fields", "items(id,snippet(title,thumbnails(high(url))),contentDetails(duration))");

    try {
      const res = await fetch(url.toString());
      const json = await res.json();

      if (Array.isArray(json.items)) {
        for (const item of json.items) {
          const id = item.id as string;
          const title = item.snippet?.title ?? "";
          const durationISO = item.contentDetails?.duration ?? "PT0S";
          const duration = iso8601ToHHMMSS(durationISO);
          const apiThumb = item.snippet?.thumbnails?.high?.url as string | undefined;
          results.push({
            id,
            title,
            duration,
            thumbnail: apiThumb ?? deriveThumb(id),
          });
        }
      }
    } catch (err) {
      console.warn("YouTube API fetch failed:", err);
      // Fallback minimal
      for (const id of group) {
        results.push({
          id,
          title: "",
          duration: "",
          thumbnail: deriveThumb(id),
        });
      }
    }
  }

  return results;
}

/** ---------------- Component ---------------- */
export default function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  // --- TV remote navigation helpers ---
  function getCols() {
    const w = window.innerWidth;
    if (w >= 1280) return 4; // xl: 4 cols
    if (w >= 768) return 2; // md/lg: 2 cols
    return 1; // base: 1 col
  }

  function getThumbs(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('div[data-focusable="thumb"]'));
  }

  function focusByIndex(next: number) {
    const thumbs = getThumbs();
    if (!thumbs.length) return;
    const clamped = Math.max(0, Math.min(next, thumbs.length - 1));
    thumbs[clamped].focus();
  }

  useEffect(() => {
    const ids = rawVideos.map((v) => v.youtubeId);
    (async () => {
      const apiData = await fetchVideosInfo(ids);
      const byId = new Map(apiData.map((v) => [v.id, v]));
      const merged: Video[] = rawVideos.map((raw) => {
        const fromApi = byId.get(raw.youtubeId);
        return {
          id: raw.youtubeId,
          title: raw.title || fromApi?.title || "Untitled",
          duration: fromApi?.duration || "",
          thumbnail: fromApi?.thumbnail || deriveThumb(raw.youtubeId),
          rating: 5,
        };
      });

      setVideos(merged);
      setLoading(false);
    })();
  }, []);

  // Auto focus the first thumbnail on home screen
  useEffect(() => {
    if (!loading && !selectedVideo) {
      const thumbs = getThumbs();
      if (thumbs[0]) thumbs[0].focus();
    }
  }, [loading, selectedVideo]);

  const handleThumbActivate = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleClose = () => {
    setSelectedVideo(null);
    // 重新聚焦到之前選中的縮圖
    setTimeout(() => {
      const thumbs = getThumbs();
      if (thumbs.length > 0) {
        thumbs[0].focus();
      }
    }, 100);
  };

  return (
    <div className="min-h-screen relative">
      <PlayfulBackground />
      <div className="relative z-10">
        <Navigation />
        <main className="max-w-10xl mx-auto p-6">
          {selectedVideo ? (
            <VideoPlayer title={selectedVideo.title || "Playing"} youtubeId={selectedVideo.id} onClose={handleClose} />
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
                <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-4 drop-shadow-lg">Welcome to KidsPlay TV!</h1>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl font-bold text-gray-800">{selectedVideo ? "More Videos You'll Love" : "Featured Videos"}</h2>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" />
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-100" />
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>

                {loading ? (
                  <div className="text-gray-500">Loading…</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                    {videos.map((video, index) => (
                      <motion.div key={video.id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 * index }}>
                        {/* TV/Keyboard focusable, unified hover/focus styles */}
                        <div
                          tabIndex={0}
                          role="button"
                          aria-label={`Play ${video.title || "video"}`}
                          data-focusable="thumb"
                          data-index={index}
                          className="
                            group
                            rounded-xl
                            transition
                            transform
                            duration-150
                            ease-out
                            focus:outline-none
                            hover:scale-105 focus:scale-105
                            hover:ring-4 focus:ring-4
                            hover:ring-pink-400 focus:ring-yellow-400
                            hover:shadow-xl focus:shadow-xl
                          "
                          onKeyDown={(e) => {
                            const code: any = (e as any).keyCode;
                            const idxAttr = (e.currentTarget as HTMLElement).getAttribute("data-index");
                            const idx = idxAttr ? parseInt(idxAttr, 10) : 0;
                            const cols = getCols();

                            // Enter / DPAD_CENTER
                            if (e.key === "Enter" || code === 23) {
                              handleThumbActivate(video);
                              return;
                            }

                            // Arrow navigation
                            if (e.key === "ArrowRight") {
                              e.preventDefault();
                              focusByIndex(idx + 1);
                            } else if (e.key === "ArrowLeft") {
                              e.preventDefault();
                              focusByIndex(idx - 1);
                            } else if (e.key === "ArrowDown") {
                              e.preventDefault();
                              focusByIndex(idx + cols);
                            } else if (e.key === "ArrowUp") {
                              e.preventDefault();
                              focusByIndex(idx - cols);
                            }
                          }}
                          onClick={() => handleThumbActivate(video)}
                        >
                          <VideoThumbnail title={video.title} duration={video.duration} thumbnail={video.thumbnail} onClick={() => handleThumbActivate(video)} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
