import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';


export default function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <>
      <h1>Welcome {currentUser.displayName}</h1>
    </>
  )
}