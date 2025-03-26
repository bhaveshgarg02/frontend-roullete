import React, { useState } from 'react';

const LockResult = ({ gameId }) => {
  const [locked, setLocked] = useState(false);

  const toggleLock = async () => {
    await fetch(`/api/lock-result/${gameId}`, {
      method: 'POST',
      body: JSON.stringify({ lock: !locked }),
      headers: { 'Content-Type': 'application/json' },
    });
    setLocked(!locked);
  };

  return (
    <div>
      <button onClick={toggleLock}>
        {locked ? 'Unlock Result' : 'Lock Result'}
      </button>
    </div>
  );
};

export default LockResult;
