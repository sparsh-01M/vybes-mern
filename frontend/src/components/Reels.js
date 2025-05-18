import { GestureWheel } from '../components/GestureWheel';

export default function ReelsPage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Optional header */}
      <div className="pt-4 px-4">
        <h1 className="text-2xl font-bold text-foreground">Reels Navigation</h1>
        <p className="text-muted-foreground">Drag the wheel to navigate</p>
      </div>
      
      {/* Gesture Wheel Container */}
      <div className="flex items-center justify-center h-[calc(100vh_-_100px)]">
        <GestureWheel />
      </div>
    </div>
  );
}