import React, { useState } from 'react';

const NotificationManager = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const sendNotification = async () => {
    await fetch('/api/send-notification', {
      method: 'POST',
      body: JSON.stringify({ title, body }),
      headers: { 'Content-Type': 'application/json' },
    });
    alert('Notification sent');
  };

  return (
    <div>
      <h1>Send Notification</h1>
      <div>
        <label>Title: </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label>Body: </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      <button onClick={sendNotification}>Send Notification</button>
    </div>
  );
};

export default NotificationManager;
