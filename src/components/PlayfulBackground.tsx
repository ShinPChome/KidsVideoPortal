import { motion } from "motion/react";
import { Star, Cloud } from "lucide-react";

export function PlayfulBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-blue-100 to-purple-100" />
      
      {/* Animated Clouds */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute text-white/30"
          initial={{ x: -100, y: Math.random() * window.innerHeight }}
          animate={{ 
            x: window.innerWidth + 100,
            y: Math.random() * window.innerHeight
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 20
          }}
          style={{
            top: `${10 + Math.random() * 70}%`,
          }}
        >
          <Cloud className={`w-${8 + Math.floor(Math.random() * 8)} h-${8 + Math.floor(Math.random() * 8)}`} fill="currentColor" />
        </motion.div>
      ))}
      
      {/* Floating Stars */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute text-yellow-300/40"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          <Star className="w-4 h-4" fill="currentColor" />
        </motion.div>
      ))}
      
      {/* Geometric Shapes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`shape-${i}`}
          className={`absolute w-8 h-8 rounded-full bg-gradient-to-br ${
            i % 4 === 0 ? 'from-pink-300/20 to-purple-300/20' :
            i % 4 === 1 ? 'from-blue-300/20 to-green-300/20' :
            i % 4 === 2 ? 'from-yellow-300/20 to-orange-300/20' :
            'from-indigo-300/20 to-pink-300/20'
          }`}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 360]
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}