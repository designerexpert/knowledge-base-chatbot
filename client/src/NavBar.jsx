import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import axios from 'axios';

export default function ButtonAppBar() {
  const [file, setFile] = useState(null);

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:8080/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Knowledge Base Chatbot
          </Typography>
          <form onSubmit={handleSubmit}>
            <Input type="file" onChange={handleFileChange} />
            <Button color="inherit" type="submit">
              Upload
            </Button>
          </form>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
