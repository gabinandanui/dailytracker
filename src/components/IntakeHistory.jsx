import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import drinkWaterGif from '../assets/drink-water-animation.gif';
import eatingGif from '../assets/eatcat.gif';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';

const IntakeHistory = ({food_type, intakeHistoryData, setintakeHistoryData, setSnackBar, setSnackBarMsg }) => {
  const { currentUser } = useAuth();
  const getNutrientIcon = (type) => {
    const normalized = type.toLowerCase();
    if (normalized === 'calories') return '🔥';
    if (normalized === 'carbs') return '🍞'; // Changed from 'carbohydrates'
    if (normalized === 'protein') return '💪';
    if (normalized === 'fats') return '🥑'; // Changed from 'fat' to match your data
    if (normalized === 'fiber') return '🌾';
    return '🥤';
  };
  const handleDelete = async (id, food_type) => {
    // Find the item to delete
    const item = intakeHistoryData.find((it) => it.id === id);
    if (!item) {
      setSnackBar(true);
      setSnackBarMsg('Item not found');
      return;
    }

    // Prepare payload for backend
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const username = currentUser?.uid || currentUser?.displayName || currentUser?.email;
    const date = new Date().toISOString().slice(0, 10);

    try {
      let response;
      if (food_type === 'water') {
        // Only send amount to avoid brittle time-string matching; for single items this is sufficient
        const payload = {
          username,
          date,
          waterItem: {
            amount: Number(item.quantity)
          }
        };

        response = await fetch(`${API_BASE}/api/data/deleteWater`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // food
        const payload = {
          username,
          date,
          foodItem: {
            name: item.food_name,
            calories: item.nutrition?.calories || 0,
            protein: item.nutrition?.protein || 0,
            carbs: item.nutrition?.carbs || 0,
            fat: item.nutrition?.fats || 0
          }
        };

        response = await fetch(`${API_BASE}/api/data/deleteFood`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const txt = await response.text();
        console.error('Failed to delete item from server:', txt);
        setSnackBar(true);
        setSnackBarMsg('Failed to delete from server');
        return;
      }

      // On success, update frontend state + localStorage
      const updatedDate = intakeHistoryData.filter((it) => it.id !== id);
      if (food_type === 'water') {
        localStorage.setItem(`intakeWaterHistory_${currentUser.uid}`, JSON.stringify(updatedDate));
      }
      if (food_type === 'food') {
        localStorage.setItem(`intakeFoodHistory_${currentUser.uid}`, JSON.stringify(updatedDate));
      }
      setintakeHistoryData(updatedDate);
      setSnackBar(true);
      setSnackBarMsg('Intake deleted');
    } catch (err) {
      console.error('Error deleting intake item:', err);
      setSnackBar(true);
      setSnackBarMsg('Error deleting intake');
    }
  };
  return (
    <>
      <Card sx={{
        minWidth: 275, borderRadius: 4, borderLeft: "4px solid #2196f3",
        background: 'rgba(29, 78, 216, 0.15)',
        marginTop: '20px',
        maxHeight: '70vh',
        overflowY: 'auto'
      }}>
        <CardContent>
          {intakeHistoryData && intakeHistoryData.length > 0 ? (
            <div>
              <h2 className='text-white text-left font-semibold'>Intake History</h2>

              {intakeHistoryData.map((item) => (
                <Card sx={{
                  minWidth: 275, border: "1px solid #2196f3",
                  background: 'rgba(29, 78, 216, 0.15)',
                  borderRadius: '8px',
                  padding: '8px',
                  marginTop: '8px'
                }} key={item.id}>
                  <span className='text-left flex mr-auto text-white items-center'>
                    <span className="animate-pulse mr-2">{item.food_info?.icon}</span>
                    {item.quantity} {item.measurement} of {item.food_name}

                    <span className="ml-auto">

                      {/* [ ['calories',16] ['protein',0.8] ['carbs',2.6] ['fats',0.5] ['fiber',0] ]
                      ↓ filter out zero
                      [ ['calories',16] ['protein',0.8] ['carbs',2.6] ['fats',0.5] ]
                      ↓ map to icons
                      [ 🔥 , 💪 , 🍞 , 🥑 ] */}
                      {item.nutrition &&
                        Object.entries(item.nutrition) // 1. Convert object to array: [['calories', 16], ['carbs', 2.6], ...]
                          .filter(([, val]) => val > 0) // 2. Keep only items with value > 0
                          .map(([nutrient, val]) => ( // 3. Map the filtered array to show icons
                            <span key={nutrient} title={String(val + 'g')} className="mr-2 cursor-pointer">
                              {getNutrientIcon(nutrient)}
                            </span>
                          ))}
                    </span>
                  </span>
                  <span className='text-left flex mr-auto text-white'>
                    {item.dateTime.split(' ')[0] + ' ' + item.dateTime.split(' ')[1]}
                    <span className='text-left flex ml-auto text-white'>
                      <DeleteIcon color="error" fontSize="small" onClick={()=> handleDelete(item.id, item.food_type)} />
                    </span>
                  </span>
                </Card>
              ))}
            </div>
          ) : (
            <p className='text-white text-left font-semibold'> <span className="animate-pulse">No intake history available.{food_type === 'water' ? ' Drink some water!' : ' Eat some food!'} </span> 
            <img className="mt-5 mx-auto" style={{ width: "240px"}} src={food_type === 'water' ? drinkWaterGif : eatingGif} alt="Empty" /></p>
          )}
        </CardContent>
        <CardActions>
        </CardActions>
      </Card>


    </>
  );
};

export default IntakeHistory;
