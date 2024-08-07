import React, { useState, useEffect } from 'react';
import { Button, Select, MenuItem, FormControl, InputLabel, Box, Typography } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { SelectChangeEvent } from '@mui/material/Select';

interface VoiceReaderProps {
  text: string;
}

const VoiceReader: React.FC<VoiceReaderProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
      setIsLoading(false);
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Initial load attempt
    loadVoices();

    // Fallback if voices don't load immediately
    const timeoutId = setTimeout(loadVoices, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser doesn't support text to speech!");
    }
  };

  const handleVoiceChange = (event: SelectChangeEvent<string>) => {
    setSelectedVoice(event.target.value);
  };

  if (isLoading) {
    return <Typography>Loading voices...</Typography>;
  }

  if (voices.length === 0) {
    return <Typography>No voices available. Your browser may not support text-to-speech.</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="voice-select-label">Voice</InputLabel>
        <Select
          labelId="voice-select-label"
          id="voice-select"
          value={selectedVoice}
          onChange={handleVoiceChange}
          label="Voice"
        >
          {voices.map((voice) => (
            <MenuItem key={voice.name} value={voice.name}>
              {voice.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        startIcon={<VolumeUpIcon />}
        onClick={speak}
        disabled={isSpeaking}
      >
        {isSpeaking ? 'Speaking...' : 'Read Aloud'}
      </Button>
    </Box>
  );
};

export default VoiceReader;