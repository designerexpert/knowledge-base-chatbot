import { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, TextField, Button, Card } from '@mui/material';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ChatComponent() {
  const [sessionId, setSessionId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch sessionId from the API upon component mount
  useEffect(() => {
    if (!sessionId) {
      const fetchSessionId = async () => {
        try {
          const response = await axios.get('/api/chat-session');
          setSessionId(response.data.sessionId);
        } catch (error) {
          console.error('Error fetching sessionId:', error);
        }
      };

      fetchSessionId();
    }
  }, [sessionId]); // Empty dependency array ensures the effect runs only once after mount

  const handleSubmit = async () => {
    if (!loading) {
      setLoading(true);
      try {
        const response = await axios.post('/api/chat-session', {
          sessionId,
          prompt,
        });
        setChatLog([...chatLog, '### Question \n' + prompt, '### Answer \n' + response.data.result]);
        setPrompt(''); // Clear the prompt after submitting
      } catch (error) {
        console.error('Error submitting prompt:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Grid container alignItems="center" sx={{ padding: 2.5 }}>
      <Grid item xs={12} md={6}>
        <h2>Submit your questions below</h2>
      </Grid>
      <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
        <p>Session ID: {sessionId}</p>
      </Grid>
      <Grid container>
        {chatLog.map((text, index) => (
          <Grid item xs={12} key={text} sx={{ paddingLeft: index % 2 == 0 ? 0 : 2.5 }}>
            <Card sx={{ padding: '0rem 2rem', marginBottom: 2 }}>
              <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={10}>
          <TextField fullWidth label="Prompt" variant="outlined" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Enter your prompt..." disabled={loading} />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button variant="contained" size="large" onClick={handleSubmit} disabled={loading}>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ChatComponent;
