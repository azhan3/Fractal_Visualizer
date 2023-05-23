import React, { useState } from 'react';

function App() {
  const [responseData, setResponseData] = useState('');

  fetch('http://localhost:8888/send-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key: 'value' }), // Replace with your JSON data
  })
    .then(response => response.text())
    .then(data => {
      // Display the response data in your React app
      console.log(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });


  return (
    <div>
      <h1>Received Data:</h1>
      <p>{responseData}</p>
    </div>
  );
}

export default App;
