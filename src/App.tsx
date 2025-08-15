import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { VideoThumbnail } from "./components/VideoThumbnail";
import { VideoPlayer } from "./components/VideoPlayer";
import { PlayfulBackground } from "./components/PlayfulBackground";
import { motion } from "motion/react";

const videoData = [
  {
    id: 1,
    title: "科博館的海洋之謎",
    duration: "12:45",
    thumbnail: "https://img.youtube.com/vi/e6I6rAIPTuI/hqdefault.jpg",
    youtubeId: "e6I6rAIPTuI",
  },
  {
    id: 2,
    title: "樂樂變身",
    duration: "8:30",
    thumbnail: "https://img.youtube.com/vi/sCu7C2zY2_s/hqdefault.jpg",
    youtubeId: "sCu7C2zY2_s",
  },
  {
    id: 3,
    title: "高鐵上的秘密",
    duration: "15:20",
    thumbnail: "https://img.youtube.com/vi/88Kk7tW0vkQ/hqdefault.jpg",
    youtubeId: "88Kk7tW0vkQ",
  },
  {
    id: 4,
    title: "小行星一起飛行",
    duration: "10:15",
    thumbnail: "https://img.youtube.com/vi/LKuDxafqXkY/hqdefault.jpg",
    youtubeId: "LKuDxafqXkY",
  },
];

export default function App() {
  const [selectedVideo, setSelectedVideo] = useState<(typeof videoData)[0] | null>(null);

  const handleThumbActivate = (video: (typeof videoData)[0]) => {
    setSelectedVideo(video);
  };

  return (
    <div className="min-h-screen relative">
      <PlayfulBackground />

      <div className="relative z-10">
        <Navigation />

        <main className="max-w-10xl mx-auto p-6">
          {selectedVideo ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
              <VideoPlayer title={selectedVideo.title} youtubeId={selectedVideo.youtubeId} onClose={() => setSelectedVideo(null)} />
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-4 drop-shadow-lg">Welcome to KidsPlay TV!</h1>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-gray-800">{selectedVideo ? "More Videos You'll Love" : "Featured Videos"}</h2>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-100" />
                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
              {videoData.map((video, index) => (
                <motion.div key={video.id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 * index }}>
                  {/* 可被 TV/鍵盤聚焦，並且 hover/focus 有一致樣式 */}
                  <div
                    tabIndex={0}
                    role="button"
                    aria-label={`Play ${video.title}`}
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
                      if (e.key === "Enter" || code === 23) {
                        handleThumbActivate(video);
                      }
                    }}
                    onClick={() => handleThumbActivate(video)}
                  >
                    <VideoThumbnail title={video.title} duration={video.duration} thumbnail={video.thumbnail} onClick={() => handleThumbActivate(video)} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
