
import React from 'react';
import { PassionCompassScores, PassionPillar } from '../types';

interface PassionCompassProps {
  scores: PassionCompassScores;
}

const pillars: PassionPillar[] = ['Conexión Emocional', 'Aventura y Novedad', 'Fantasía e Intensidad', 'Juego y Diversión'];

const PassionCompass: React.FC<PassionCompassProps> = ({ scores }) => {
  const size = 300;
  const center = size / 2;
  const radius = center * 0.8;
  const numLevels = 5;

  const points = pillars.map((pillar, i) => {
    const angle = (Math.PI / 2) - (2 * Math.PI * i) / pillars.length;
    const score = Math.max(scores[pillar] || 0, 5); // Minimum score of 5 for visibility
    const pointRadius = (score / 100) * radius;
    const x = center + pointRadius * Math.cos(angle);
    const y = center - pointRadius * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const labelPoints = pillars.map((pillar, i) => {
    const angle = (Math.PI / 2) - (2 * Math.PI * i) / pillars.length;
    const labelRadius = radius * 1.15;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center - labelRadius * Math.sin(angle),
      label: pillar,
    };
  });
  
  const getTextAnchor = (angle: number): string => {
      const degrees = (angle * 180 / Math.PI) % 360;
      if (degrees > 80 && degrees < 100) return 'middle';
      if (degrees > 260 && degrees < 280) return 'middle';
      if (degrees > 90 && degrees < 270) return 'end';
      return 'start';
  }


  return (
    <div className="relative w-full max-w-sm mx-auto" style={{ height: `${size}px` }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        <g className="text-brand-muted/30">
          {/* Concentric circles */}
          {Array.from({ length: numLevels }).map((_, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={(radius * (i + 1)) / numLevels}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
          {/* Axis lines */}
          {pillars.map((_, i) => {
            const angle = (Math.PI / 2) - (2 * Math.PI * i) / pillars.length;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center - radius * Math.sin(angle);
            return <line key={i} x1={center} y1={center} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" />;
          })}
        </g>
        {/* Data polygon */}
        <polygon
          points={points}
          className="fill-brand-accent/50 stroke-brand-accent"
          strokeWidth="2"
        />
        {/* Labels */}
        {labelPoints.map(({ x, y, label }, i) => {
            const angle = (Math.PI / 2) - (2 * Math.PI * i) / pillars.length;
            const words = label.split(' ');
            return (
                <text
                    key={label}
                    x={x}
                    y={y}
                    className="text-xs font-semibold fill-current text-brand-muted"
                    textAnchor={getTextAnchor(angle)}
                    dominantBaseline="middle"
                >
                  {words[0]} {words[1]}
                  {words.length > 2 && <tspan x={x} dy="1.2em">{words.slice(2).join(' ')}</tspan>}
                </text>
            )
        })}
      </svg>
    </div>
  );
};

export default PassionCompass;
