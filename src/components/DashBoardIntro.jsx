import React from 'react'
import Typography from '@mui/material/Typography';

const DashBoardIntro = () => {
  return (
    <>
      <Typography variant="h1" component="div">
        Dashboard
      </Typography>
      <Typography gutterBottom sx={{ color: 'text.white', fontSize: 14 }}>
        Welcome back! Here's your health overview for today.
        Friday, October 10, 2025
      </Typography>
    </>
  )
}

export default DashBoardIntro