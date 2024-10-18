import React from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const Confetti: React.FC = () => {
  const { width, height } = useWindowSize();

  if (typeof width !== 'number' || typeof height !== 'number') {
    return null;
  }

  return (
    <ReactConfetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.1}
      initialVelocityY={20}
      initialVelocityX={5}
      colors={['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722']}
    />
  );
};

export default Confetti;