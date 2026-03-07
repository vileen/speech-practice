import { useState } from 'react';
import './OfflineScreen.css';

const FUNNY_GIFS = [
  'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif', // Confused cat
  'https://media.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.gif', // Dead computer
  'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif', // Error cat
];

const FUNNY_MESSAGES = [
  "Someone forgot to pay their internet bill 💸",
  "The hamster powering our servers took a coffee break ☕",
  "Even the WiFi is on vacation 🏖️",
  "Our backend is playing hide and seek... and winning 🙈",
  "The server is having an existential crisis 🤔",
  "Looks like our API went to grab a snack 🍕",
  "404: Motivation not found 🔍",
  "The internet tubes are clogged 🚰",
];

interface OfflineScreenProps {
  apiUrl: string;
  onRetry: () => void;
}

export function OfflineScreen({ apiUrl, onRetry }: OfflineScreenProps) {
  const [gifUrl] = useState(() => 
    FUNNY_GIFS[Math.floor(Math.random() * FUNNY_GIFS.length)]
  );
  const [message] = useState(() => 
    FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)]
  );

  return (
    <div className="offline-screen">
      <div className="offline-container">
        <div className="gif-container">
          <img src={gifUrl} alt="Error" className="error-gif" />
        </div>
        <h1 className="offline-title">Oops! 🙃</h1>
        <p className="offline-message">{message}</p>
        <div className="offline-details">
          <p>Can't reach: <code>{apiUrl}</code></p>
          <p className="offline-hint">Check your connection or try again later</p>
        </div>
        <button className="retry-btn" onClick={onRetry}>
          🔄 Try Again
        </button>
      </div>
    </div>
  );
}
