import { Play, Clock, Star } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface VideoThumbnailProps {
  title: string;
  duration: string;
  thumbnail: string;
  onClick: () => void;
}

export function VideoThumbnail({ title, duration, thumbnail, onClick }: VideoThumbnailProps) {
  return (
    <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} className="relative group cursor-pointer" onClick={onClick}>
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-transparent hover:border-yellow-300 transition-all duration-300">
        {/* Thumbnail Image */}
        <div className="relative aspect-video bg-gradient-to-br from-blue-200 to-purple-200">
          <ImageWithFallback src={thumbnail} alt={title} className="w-full h-full object-cover" />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Play className="w-8 h-8 text-blue-500 ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span className="text-sm font-medium">{duration}</span>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 leading-tight">{title}</h3>
        </div>
      </div>
    </motion.div>
  );
}
