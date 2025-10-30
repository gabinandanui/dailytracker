// src/components/AIFoodInput.jsx
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

const AIFoodInput = ({ handleIntakeFoodAnalyzed }) => {
  const [loading, setLoading] = useState(false);
  const [foodInput, setFoodInput] = useState('');
  const [error, setError] = useState('');

  const handleFoodAnalysisClick = async () => {
    if (!foodInput.trim()) {
      setError('Please enter some text.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      console.log('🚀 Step 1: Preparing request...');

      const now = new Date();
      const pad = (n) => n.toString().padStart(2, '0');
      const hours = now.getHours();
      const hours12 = hours % 12 === 0 ? 12 : hours % 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const localDateTime = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(hours12)}:${pad(now.getMinutes())} ${ampm}`;

      console.log('🚀 Step 2: Making API request...');
      const response = await fetch('/api/analyzeFoodIntake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: foodInput, clientDateTime: localDateTime }),
      });

      console.log('🚀 Step 3: Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        console.log('❌ Step 3a: Response not OK, getting error...');
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      console.log('🚀 Step 4: Parsing JSON...');
      const responseText = await response.text();
      console.log('📄 Raw response:', responseText);

      const items = JSON.parse(responseText);
      console.log('✅ Step 5: Parsed items:', items);

      console.log('🚀 Step 6: Calling parent callback...');
      // Pass the entire array to the parent
      handleIntakeFoodAnalyzed(items);
      console.log('✅ Step 7: Parent callback completed');

      console.log('🚀 Step 8: Clearing input...');
      setFoodInput('');
      console.log('✅ Step 9: All steps completed successfully!');
    } catch (err) {
      console.error('🚨 Error occurred at step:', err.message);
      console.error('🚨 Full error:', err);
      setError('Sorry, something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined" sx={{
      minWidth: 275,
      borderRadius: 4,
      borderLeft: "4px solid #4caf50",
      background: 'rgba(38, 166, 154, 0.15)'
    }}>
      <CardContent className="flex flex-col gap-2">
        <h2 className='font-semibold pb-2 text-white text-left'>
          Add Food Intake with AI
        </h2>
        <TextField
          fullWidth
          placeholder="e.g., I had 2 idlis and a cup of sambhar at 08:30 AM"
          value={foodInput}
          onChange={(e) => setFoodInput(e.target.value)}
          disabled={loading}
          sx={{
            input: { color: 'white' },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "gray" },
              "&:hover fieldset": { borderColor: "white" },
            },
            "& .MuiFormLabel-root": { color: "gray" },
          }}
        />
        <Button
          variant="contained"
          onClick={handleFoodAnalysisClick}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Analyzing...' : 'Add Food with AI'}
        </Button>
        {error && <Typography color="error" variant="body2">{error}</Typography>}
      </CardContent>
    </Card>
  );
};

export default AIFoodInput;
