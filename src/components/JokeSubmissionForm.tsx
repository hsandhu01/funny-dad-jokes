import React, { useState } from 'react';

interface JokeSubmissionFormProps {
  onSubmit: (joke: { setup: string; punchline: string; category: string }) => void;
}

const JokeSubmissionForm: React.FC<JokeSubmissionFormProps> = ({ onSubmit }) => {
  const [setup, setSetup] = useState('');
  const [punchline, setPunchline] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ setup, punchline, category });
    setSetup('');
    setPunchline('');
    setCategory('');
  };

  return (
    <form onSubmit={handleSubmit} className="joke-submission-form">
      <input
        type="text"
        value={setup}
        onChange={(e) => setSetup(e.target.value)}
        placeholder="Setup"
        required
      />
      <input
        type="text"
        value={punchline}
        onChange={(e) => setPunchline(e.target.value)}
        placeholder="Punchline"
        required
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      >
        <option value="">Select Category</option>
        <option value="pun">Pun</option>
        <option value="wordplay">Wordplay</option>
        <option value="science">Science</option>
        <option value="animals">Animals</option>
      </select>
      <button type="submit">Submit Joke</button>
    </form>
  );
};

export default JokeSubmissionForm;