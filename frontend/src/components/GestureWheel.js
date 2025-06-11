"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Book, Briefcase, Clapperboard, Dumbbell, Gamepad2, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const segments = [
  { id: 1, label: 'Education', imageUrl: 'https://res.cloudinary.com/do5w3vlu0/image/upload/v1747310087/20250515_1724_Woman_Immersed_in_Books_simple_compose_01jv9wp0csfcdb5xjjbf5psrpq_neuiqh.png', color: 'hsl(var(--secondary))', activeColor: 'hsl(var(--accent))', path: '/education' },
  { id: 2, label: 'Business', imageUrl: 'https://res.cloudinary.com/do5w3vlu0/image/upload/v1747311369/20250515_1745_Corporate_Hustle_simple_compose_01jv9xxc0cf60vkn691858tzf1_wzgsah.png', color: 'hsl(var(--secondary))', activeColor: 'hsl(var(--accent))', path: '/business' },
  { id: 3, label: 'Entertainment', imageUrl: 'https://res.cloudinary.com/do5w3vlu0/image/upload/v1747311489/20250515_1747_Joyful_Movie_Night_simple_compose_01jv9y1pf6fc6tx9nbjckz8eev_zlonam.png', color: 'hsl(var(--secondary))', activeColor: 'hsl(var(--accent))', path: '/entertainment' },
  { id: 4, label: 'Sports/Fitness', imageUrl: 'https://res.cloudinary.com/do5w3vlu0/image/upload/v1747311228/20250515_1742_Nature_Handstand_Pose_simple_compose_01jv9xq11mefvv1chd49jyfjjd_bqcj7h.png', color: 'hsl(var(--secondary))', activeColor: 'hsl(var(--accent))', path: '/sports-fitness' },
  { id: 5, label: 'Gaming', imageUrl: 'https://res.cloudinary.com/do5w3vlu0/image/upload/v1747311111/20250515_1740_Gamer_in_Action_simple_compose_01jv9xkrnxffp891zmfx8fqa4w_mufb85.png', color: 'hsl(var(--secondary))', activeColor: 'hsl(var(--accent))', path: '/gaming' },
  { id: 6, label: 'Food/Travel', imageUrl: 'https://res.cloudinary.com/do5w3vlu0/image/upload/v1747309894/20250515_1720_Balloon_Over_Mountain_Feast_simple_compose_01jv9wdk0kf719a37v6ds69p5w_rto4zx.png', color: 'hsl(var(--secondary))', activeColor: 'hsl(var(--accent))', path: '/food-travel' },
];

const WHEEL_RADIUS = 300;
const INNER_RADIUS = WHEEL_RADIUS * 0.4;
const TOTAL_SEGMENTS = segments.length;
const TOTAL_ANGLE = 360;
const GAP_ANGLE = 2;
const USABLE_ANGLE = TOTAL_ANGLE - TOTAL_SEGMENTS * GAP_ANGLE;
const SEGMENT_ANGLE = USABLE_ANGLE / TOTAL_SEGMENTS;
const DRAG_SENSITIVITY = 0.5;

const describeArcSegment = (cx, cy, outerRadius, innerRadius, startAngle, endAngle, gapAngle) => {
  const gapAdjust = gapAngle / 2;
  const startRadOuter = ((startAngle + gapAdjust) * Math.PI) / 180;
  const endRadOuter = ((endAngle - gapAdjust) * Math.PI) / 180;
  const startRadInner = ((startAngle + gapAdjust) * Math.PI) / 180;
  const endRadInner = ((endAngle - gapAdjust) * Math.PI) / 180;

  const startOuter = {
    x: cx + outerRadius * Math.cos(startRadOuter),
    y: cy + outerRadius * Math.sin(startRadOuter),
  };
  const endOuter = {
    x: cx + outerRadius * Math.cos(endRadOuter),
    y: cy + outerRadius * Math.sin(endRadOuter),
  };
  const startInner = {
    x: cx + innerRadius * Math.cos(startRadInner),
    y: cy + innerRadius * Math.sin(startRadInner),
  };
  const endInner = {
    x: cx + innerRadius * Math.cos(endRadInner),
    y: cy + innerRadius * Math.sin(endRadInner),
  };

  const largeArcFlagOuter = (endAngle - gapAdjust) - (startAngle + gapAdjust) <= 180 ? '0' : '1';
  const d = [
    'M', startInner.x, startInner.y,
    'L', startOuter.x, startOuter.y,
    'A', outerRadius, outerRadius, 0, largeArcFlagOuter, '1', endOuter.x, endOuter.y,
    'L', endInner.x, endInner.y,
    'A', innerRadius, innerRadius, 0, largeArcFlagOuter, '0', startInner.x, startInner.y,
    'Z',
  ].join(' ');

  return d;
};

const normalizeAngle = (angle) => {
  let normalized = angle % 360;
  if (normalized > 180) normalized -= 360;
  else if (normalized <= -180) normalized += 360;
  return normalized;
};

export function GestureWheel() {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);
  const [activeSegment, setActiveSegment] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [reels, setReels] = useState([]);
  const constraintsRef = useRef(null);
  const rotationMotionValue = useMotionValue(0);
  const lastTapTimeRef = useRef(0);
  const doubleTapTimeoutRef = useRef(null);

  useEffect(() => {
    const unsubscribe = rotationMotionValue.onChange((latest) => {
      setRotation(latest);
      const normalizedRotation = latest % 360;
      const effectiveRotation = (normalizedRotation + 360) % 360;
      const selectorAngleDegrees = 180;

      let currentActiveSegment = null;
      for (let i = 0; i < segments.length; i++) {
        const segmentCenterAngle = 180 + i * (SEGMENT_ANGLE + GAP_ANGLE);
        const segmentStartAngleWithGap = segmentCenterAngle - (SEGMENT_ANGLE + GAP_ANGLE) / 2;
        const segmentEndAngleWithGap = segmentCenterAngle + (SEGMENT_ANGLE + GAP_ANGLE) / 2;
        const segmentStartAngle = segmentStartAngleWithGap + GAP_ANGLE / 2;
        const segmentEndAngle = segmentEndAngleWithGap - GAP_ANGLE / 2;

        let rotatedStart = (segmentStartAngle - effectiveRotation + 360) % 360;
        let rotatedEnd = (segmentEndAngle - effectiveRotation + 360) % 360;

        if (rotatedStart <= rotatedEnd) {
          if (selectorAngleDegrees >= rotatedStart && selectorAngleDegrees < rotatedEnd) {
            currentActiveSegment = segments[i].id;
            break;
          }
        } else {
          if (selectorAngleDegrees >= rotatedStart || selectorAngleDegrees < rotatedEnd) {
            currentActiveSegment = segments[i].id;
            break;
          }
        }
      }
      setActiveSegment(currentActiveSegment);
    });
    return unsubscribe;
  }, [rotationMotionValue]);

  // Fetch reels based on the active segment
  useEffect(() => {
    if (activeSegment) {
      const segment = segments.find(s => s.id === activeSegment);
      if (segment) {
        fetch(`http://localhost:4000/reels/${segment.label.toLowerCase()}`)
          .then(response => response.json())
          .then(data => setReels(data))
          .catch(error => console.error('Error fetching reels:', error));
      }
    }
  }, [activeSegment]);

  // Navigate to the selected segment's page
  useEffect(() => {
    if (selectedSegment) {
      const segment = segments.find(s => s.id === selectedSegment);
      if (segment && segment.path) {
        navigate(segment.path);
      }
      setSelectedSegment(null); // Reset after navigation
    }
  }, [selectedSegment, navigate]);

  const handleDrag = (event, info) => {
    // Change rotation based on vertical drag delta
    const deltaRotation = info.delta.y * DRAG_SENSITIVITY;
    const newRotation = rotation + deltaRotation;
    rotationMotionValue.set(newRotation);
  };

  const handleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;
    
    // Clear any existing double tap timeout
    if (doubleTapTimeoutRef.current) {
      clearTimeout(doubleTapTimeoutRef.current);
    }
    
    if (timeSinceLastTap < 300) { // Double tap detected
      // Navigate to the active segment
      if (activeSegment) {
        setSelectedSegment(activeSegment);
      }
    } else {
      // Set a timeout for possible second tap
      doubleTapTimeoutRef.current = setTimeout(() => {
        // Single tap logic if needed
        doubleTapTimeoutRef.current = null;
      }, 300);
    }
    
    lastTapTimeRef.current = now;
  };
  
  // Add a dedicated click handler for the segment selection
  const handleSegmentClick = (segmentId) => {
    setSelectedSegment(segmentId);
  };

  return (
    <div
      ref={constraintsRef}
      className="relative w-[calc(var(--wheel-radius)_+_50px)] h-screen flex items-center justify-start overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ '--wheel-radius': `${WHEEL_RADIUS}px` }}
      aria-label="Gesture wheel control. Drag vertically to rotate. Click on a segment or double tap to navigate."
    >
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0}
        onDrag={handleDrag}
        onTap={handleTap}
        style={{
          rotate: rotationMotionValue,
          width: `calc(var(--wheel-radius) * 2)`,
          height: `calc(var(--wheel-radius) * 2)`,
          position: 'absolute',
          left: `calc(var(--wheel-radius) * -1)`,
          top: '20%',
          transform: 'translateY(-50%)',
          transformOrigin: '50% 50%',
        }}
        role="slider"
        aria-orientation="vertical"
        aria-valuemin={-180}
        aria-valuemax={180}
        aria-valuenow={normalizeAngle(rotation)}
        aria-valuetext={segments.find(s => s.id === activeSegment)?.label || 'None selected'}
      >
        <svg
          viewBox={`-${WHEEL_RADIUS} -${WHEEL_RADIUS} ${WHEEL_RADIUS * 2} ${WHEEL_RADIUS * 2}`}
          width={WHEEL_RADIUS * 2}
          height={WHEEL_RADIUS * 2}
          className="overflow-visible"
        >
          {/* Define SVG clipPaths for each segment */}
          <defs>
            {segments.map((segment, index) => {
              const segmentMidPointAngle = 180 + index * (SEGMENT_ANGLE + GAP_ANGLE);
              const startAngle = segmentMidPointAngle - (SEGMENT_ANGLE + GAP_ANGLE) / 2;
              const endAngle = segmentMidPointAngle + (SEGMENT_ANGLE + GAP_ANGLE) / 2;
              
              return (
                <clipPath id={`segment-clip-${segment.id}`} key={`clip-${segment.id}`}>
                  <path 
                    d={describeArcSegment(0, 0, WHEEL_RADIUS, INNER_RADIUS, startAngle, endAngle, GAP_ANGLE)} 
                  />
                </clipPath>
              );
            })}
          </defs>
          
          <g transform="translate(0, 0)">
            {segments.map((segment, index) => {
              const segmentMidPointAngle = 180 + index * (SEGMENT_ANGLE + GAP_ANGLE);
              const startAngle = segmentMidPointAngle - (SEGMENT_ANGLE + GAP_ANGLE) / 2;
              const endAngle = segmentMidPointAngle + (SEGMENT_ANGLE + GAP_ANGLE) / 2;
              const isActive = segment.id === activeSegment;
              
              // Calculate image position for the segment
              const middleRadius = (WHEEL_RADIUS + INNER_RADIUS) / 2;
              const middleAngleRad = segmentMidPointAngle * Math.PI / 180;
              const middleX = middleRadius * Math.cos(middleAngleRad);
              const middleY = middleRadius * Math.sin(middleAngleRad);
              
              // Calculate segment dimensions for better image sizing
              const segmentWidth = WHEEL_RADIUS - INNER_RADIUS;
              const segmentArcLength = (SEGMENT_ANGLE * Math.PI / 180) * ((WHEEL_RADIUS + INNER_RADIUS) / 2);
              
              // Make the image slightly larger than the segment for better coverage
              const imageSize = Math.max(segmentWidth, segmentArcLength) * 1.5;

              return (
                <g key={segment.id}>
                  {/* Segment path */}
                  <motion.path
                    d={describeArcSegment(0, 0, WHEEL_RADIUS, INNER_RADIUS, startAngle, endAngle, GAP_ANGLE)}
                    fill={isActive ? segment.activeColor : segment.color}
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    initial={false}
                    animate={{ fill: isActive ? segment.activeColor : segment.color }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleSegmentClick(segment.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Image clipped to segment shape */}
                  <g clipPath={`url(#segment-clip-${segment.id})`}>
                    <image
                      href={segment.imageUrl}
                      x={middleX - imageSize/2}
                      y={middleY - imageSize/2}
                      width={imageSize}
                      height={imageSize}
                      preserveAspectRatio="xMidYMid slice"
                      aria-hidden="true"
                      style={{ 
                        pointerEvents: "none"
                      }}
                      data-ai-hint="image for segment"
                    />
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </motion.div>

      <div className="absolute top-1/2 left-[8px] transform -translate-y-1/2 w-1 h-4 bg-accent rounded-full z-10" aria-hidden="true"></div>
      <div className="absolute left-[24px] top-1/2 transform -translate-y-1/2 text-left text-foreground text-lg font-semibold w-24 pl-2" aria-live="polite">
        {segments.find(s => s.id === activeSegment)?.label || ' '}
      </div>

      {/* Display reels for the active segment */}
      {activeSegment && (
        <div className="absolute left-[24px] top-1/2 transform -translate-y-1/2 mt-8">
          <h3 className="text-lg font-semibold">Reels</h3>
          <ul>
            {reels.map(reel => (
              <li key={reel._id} className="mt-2">
                <video src={reel.videoUrl} controls className="w-64 h-36" />
                <p className="text-sm">{reel.title}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}