import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';



const settings = {
  margin: { right: 5 },
  width: 200,
  height: 200,
  hideLegend: true,
};

export default function CardsWaterChart({waterLevel, targetWater}) {
  const newRemaining = targetWater - waterLevel;

  const newDrunkPercent = parseFloat((waterLevel / targetWater * 100).toFixed(1));

  const newBalancePercent = parseFloat((100 - newDrunkPercent).toFixed(1));

  const data = [
  { label: `Drunk ${newDrunkPercent}%`, value: waterLevel, color: '#0088FE' },
  { label: `Balance ${newBalancePercent}%`, value: newRemaining, color: '#00C49F' },
];
  return (
    <PieChart
      series={[{ innerRadius: 70, outerRadius: 100, data,  }]}
      {...settings}
    >
    </PieChart>
  );
}
