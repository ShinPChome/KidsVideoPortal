import { Home, Search, Heart, User, Star } from "lucide-react";
import { Button } from "./ui/button";

export function Navigation() {
  return (
    <nav className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 p-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <Star className="w-6 h-6 text-orange-500" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">KidsPlay TV</h1>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="lg" className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 rounded-full px-6 py-3 transition-all duration-300 hover:scale-105">
            <Home className="w-5 h-5 mr-2" />
            Home
          </Button>

          <Button variant="ghost" size="lg" className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 rounded-full px-6 py-3 transition-all duration-300 hover:scale-105">
            <Search className="w-5 h-5 mr-2" />
            Search
          </Button>

          <Button variant="ghost" size="lg" className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 rounded-full px-6 py-3 transition-all duration-300 hover:scale-105">
            <Heart className="w-5 h-5 mr-2" />
            Favorites
          </Button>
        </div>
      </div>
    </nav>
  );
}
