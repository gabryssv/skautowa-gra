export function PixelStar({ className = "", color = "#ffd700" }: { className?: string, color?: string }) {
  return (
    <div className={`inline-block ${className}`} style={{ width: '16px', height: '16px' }}>
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="2" width="4" height="4" fill={color}/>
        <rect x="10" y="6" width="4" height="4" fill={color}/>
        <rect x="2" y="6" width="4" height="4" fill={color}/>
        <rect x="6" y="10" width="4" height="4" fill={color}/>
        <rect x="6" y="6" width="4" height="4" fill={color}/>
      </svg>
    </div>
  );
}

export function PixelHeart({ className = "", color = "#ff6b6b" }: { className?: string, color?: string }) {
  return (
    <div className={`inline-block ${className}`} style={{ width: '16px', height: '16px' }}>
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="2" height="2" fill={color}/>
        <rect x="4" y="2" width="2" height="2" fill={color}/>
        <rect x="10" y="2" width="2" height="2" fill={color}/>
        <rect x="12" y="2" width="2" height="2" fill={color}/>
        <rect x="0" y="4" width="2" height="2" fill={color}/>
        <rect x="2" y="4" width="2" height="2" fill={color}/>
        <rect x="4" y="4" width="2" height="2" fill={color}/>
        <rect x="6" y="4" width="2" height="2" fill={color}/>
        <rect x="8" y="4" width="2" height="2" fill={color}/>
        <rect x="10" y="4" width="2" height="2" fill={color}/>
        <rect x="12" y="4" width="2" height="2" fill={color}/>
        <rect x="14" y="4" width="2" height="2" fill={color}/>
        <rect x="0" y="6" width="2" height="2" fill={color}/>
        <rect x="2" y="6" width="2" height="2" fill={color}/>
        <rect x="4" y="6" width="2" height="2" fill={color}/>
        <rect x="6" y="6" width="2" height="2" fill={color}/>
        <rect x="8" y="6" width="2" height="2" fill={color}/>
        <rect x="10" y="6" width="2" height="2" fill={color}/>
        <rect x="12" y="6" width="2" height="2" fill={color}/>
        <rect x="14" y="6" width="2" height="2" fill={color}/>
        <rect x="2" y="8" width="2" height="2" fill={color}/>
        <rect x="4" y="8" width="2" height="2" fill={color}/>
        <rect x="6" y="8" width="2" height="2" fill={color}/>
        <rect x="8" y="8" width="2" height="2" fill={color}/>
        <rect x="10" y="8" width="2" height="2" fill={color}/>
        <rect x="12" y="8" width="2" height="2" fill={color}/>
        <rect x="4" y="10" width="2" height="2" fill={color}/>
        <rect x="6" y="10" width="2" height="2" fill={color}/>
        <rect x="8" y="10" width="2" height="2" fill={color}/>
        <rect x="10" y="10" width="2" height="2" fill={color}/>
        <rect x="6" y="12" width="2" height="2" fill={color}/>
        <rect x="8" y="12" width="2" height="2" fill={color}/>
      </svg>
    </div>
  );
}

export function PixelBorder({ children, color = "#ffd700", className = "" }: { children: React.ReactNode, color?: string, className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Corners */}
      <div className="absolute top-0 left-0 w-2 h-2" style={{ backgroundColor: color }} />
      <div className="absolute top-0 right-0 w-2 h-2" style={{ backgroundColor: color }} />
      <div className="absolute bottom-0 left-0 w-2 h-2" style={{ backgroundColor: color }} />
      <div className="absolute bottom-0 right-0 w-2 h-2" style={{ backgroundColor: color }} />
      
      {/* Edges */}
      <div className="absolute top-0 left-2 right-2 h-1" style={{ backgroundColor: color }} />
      <div className="absolute bottom-0 left-2 right-2 h-1" style={{ backgroundColor: color }} />
      <div className="absolute left-0 top-2 bottom-2 w-1" style={{ backgroundColor: color }} />
      <div className="absolute right-0 top-2 bottom-2 w-1" style={{ backgroundColor: color }} />
      
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
