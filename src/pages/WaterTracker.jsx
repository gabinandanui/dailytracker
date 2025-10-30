import React, { useRef } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AIWaterInput from '../components/AIWaterInput';
import IntakeHistory from '../components/IntakeHistory';
import CardsWaterChart from '../components/CardsWaterChart';
import { useAuth } from '../context/AuthContext';

const WaterTracker = ({ targetWater, setTargetWater, intakeWaterHistoryData, setintakeWaterHistoryData, setSnackBar, setSnackBarMsg }) => {
  const targetWaterRef = useRef(null);
  const targetIntakeWaterRef = useRef(null);

  const handleTargetWaterChange = () => {
    const newTarge = parseInt(targetWaterRef.current.value, 10);
    if (!isNaN(newTarge)) {
      setTargetWater(newTarge);
    }
    setSnackBar(true);
    setSnackBarMsg('Water Target Updated')
  };
  const computedWaterml = React.useMemo(() => {
    return intakeWaterHistoryData.reduce((total, item) => {
      return total + item.quantity;
    }, 0);
  }, [intakeWaterHistoryData])

  const { currentUser } = useAuth();

  const handleIntakeWaterAnalyzed = (data) => {
    if (data && data.quantity > 0) {
      console.log(`AI detected you drank ${data.quantity}${data.measurement}. Adding to total.`);
      // We use the same safe updater pattern here
      let currentData = data;
      let transferSavedDate;
      console.log('====================================');
      console.log(data);
      console.log('====================================');
      const waterHistoryKey = `intakeWaterHistory_${currentUser.uid}`;
      const waterTargetKey = `targetWater_${currentUser.uid}`;
      const savedWaterHistory = localStorage.getItem(waterHistoryKey);
      const savedWaterTarget = localStorage.getItem(waterTargetKey);
      if(savedWaterHistory && savedWaterHistory !== '[]') {
        transferSavedDate = JSON.parse(savedWaterHistory);
        transferSavedDate.push(data);
      }
      else {
        transferSavedDate = [data];
      }
      setintakeWaterHistoryData(transferSavedDate);
      setSnackBar(true);
      setSnackBarMsg(`${data.quantity} ${data.measurement} of ${data.food_name} added`);
    }
  };


  return (
    <>
    
      <div className='flex flex-col text-white text-left'>
        <h1>💧 Water Tracker</h1>
        <p>Stay hydrated and track your daily water intake</p>
      </div>
      <div className='flex flex-col md:flex-row gap-4 tracker-layout'>
        <div className='tracker-layout flex-1 mt-5'>
          <AIWaterInput intakeWaterHistoryData={intakeWaterHistoryData} setintakeWaterHistoryData={setintakeWaterHistoryData} onIntakeAnalyzed={handleIntakeWaterAnalyzed} />
          <IntakeHistory food_type='water' intakeHistoryData={intakeWaterHistoryData} setintakeHistoryData={setintakeWaterHistoryData} setSnackBar={setSnackBar} setSnackBarMsg={setSnackBarMsg}/>
        </div>
        <div className='tracker-log flex-1'>
          <CardsWaterChart waterLevel={computedWaterml} targetWater={targetWater} />
          <h2 className='font-semibold pt-2 text-white text-center'>
          {computedWaterml}/{targetWater} ml
        </h2>
          <Card variant="outlined" sx={{
            minWidth: 275, borderRadius: 4, borderLeft: "4px solid #2196f3",
            background: 'rgba(29, 78, 216, 0.15)',
            marginTop: '20px'
          }}>
            <CardContent className='flex flex-col'>
              <h2 className='font-semibold pb-2 text-white text-left'>
                Daily Water Target (ml)
              </h2>
              <div className="flex flex-col justify-between">

                <TextField
                  type='number'
                  inputRef={targetWaterRef}
                  placeholder={targetWater  || "Set daily water target" }
                  sx={{
                    input: {
                      color: 'white',
                      width: '100%'
                    },
                  }}
                  className="w-full bg-gray-800 px-3 py-2 rounded-md"
                />
                <Button
                  variant="contained"
                  color="primary"
                  className='ml-auto mt-2 rounded-xs'
                  onClick={handleTargetWaterChange}
                >
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default WaterTracker