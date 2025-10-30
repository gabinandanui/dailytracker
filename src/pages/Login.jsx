// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../firebase';
import { TextField, Button, Card, Typography, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

// Handler for Email/Password Login
  const handleLogin = async () => {
    setError(''); // Clear previous errors
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    }
  };

  // Handler for Email/Password Sign Up
  const handleSignup = async () => {
    setError(''); // Clear previous errors
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign up. The email may already be in use.');
    }
  };
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in with Google');
      console.error(err);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: '50px auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>Login / Sign Up</Typography>
      <TextField label="Email" type="email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <Typography color="error">{error}</Typography>}
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button variant="contained" onClick={handleLogin}>Login</Button>
        <Button variant="outlined" onClick={handleSignup}>Sign Up</Button>
      </Box>
      <Typography sx={{ my: 2, textAlign: 'center' }}>or</Typography>
      <Button variant="contained" color="secondary" fullWidth startIcon={<GoogleIcon />} onClick={handleGoogleSignIn}>
        Sign In with Google
      </Button>
    </Card>
  );
};

export default Login;