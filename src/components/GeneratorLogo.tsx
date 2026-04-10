import React from 'react';
import Image from 'next/image';

interface GeneratorLogoProps {
  className?: string;
  height?: number;
}

const GeneratorLogo: React.FC<GeneratorLogoProps> = ({ className = "", height = 40 }) => {
  // Image dimensions: 1920 x 332 (aspect ratio ~5.78:1)
  const aspectRatio = 1920 / 332;
  const width = Math.round(height * aspectRatio);
  
  return (
    <Image
      src="/generator-logo copy.png"
      alt="The Generator - Interdisciplinary AI Lab"
      height={height}
      width={width}
      priority
      style={{ objectFit: 'contain' }}
      className={className}
    />
  );
};

export default GeneratorLogo;