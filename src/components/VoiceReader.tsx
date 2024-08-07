import React, { useState } from 'react';
import Button from '@mui/material/Button';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

interface VoiceReaderProps {
  text: string;
}

const VoiceReader: React.FC<VoiceReaderProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser doesn't support text to speech!");
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<VolumeUpIcon />}
      onClick={speak}
      disabled={isSpeaking}
    >
      {isSpeaking ? 'Speaking...' : 'Read Aloud'}
    </Button>
  );
};

export default VoiceReader;