import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import DashBoardIntro from '../components/DashBoardIntro';
import HydrationCard from '../components/HydrationCard';
const Dashboard = ({waterLevel, setWaterLevel, targetWater, intakeWaterHistoryData}) => {
  const computedWaterml = React.useMemo(() => {
    return intakeWaterHistoryData.reduce((total, item) => {
      return total + item.quantity;
    }, 0);
  }, [intakeWaterHistoryData])
  return (
    <>
      <DashBoardIntro />
      <div className=' flex flex-col md:flex-row gap-4'>
        <Card sx={{ minWidth: 275, borderRadius: 4, }}>
          <CardContent>
            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
              🍽️ Nutrition
            </Typography>
            <Typography variant="body2">
              
            </Typography>
            <Chip label="Coming soon" color="warning" variant="outlined" />
          </CardContent>
        </Card>
        <HydrationCard waterLevel={computedWaterml} setWaterLevel={setWaterLevel} targetWater={targetWater}/>
      </div>
    </>
  )
}

export default Dashboard