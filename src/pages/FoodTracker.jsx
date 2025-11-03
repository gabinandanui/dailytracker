// src/pages/FoodTracker.jsx
import React, { useState, useRef } from "react";
import { foodDataByKey } from "../foodData";
import { generateId } from "../utils/generateId";
import AutoCompleteComponent from "../components/AutoCompleteComponent";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IntakeHistory from "../components/IntakeHistory";
import { useAuth } from '../context/AuthContext';


const FoodTracker = ({
  setSnackBar,
  setSnackBarMsg,
  intakeFoodHistoryData,
  setintakeFoodHistoryData,
  targetCalories,
  setTargetCalories,
}) => {
  const foodQuantityRef = useRef(null);
  const { currentUser } = useAuth();

  // Load existing data on mount
  React.useEffect(() => {
    const loadExistingData = async () => {
      if (!currentUser) return;

      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const today = new Date().toISOString().slice(0, 10);
        const username = currentUser?.uid || currentUser?.displayName || currentUser?.email;
        
        const response = await fetch(`${API_BASE}/api/data/get/${username}/${today}`);
        if (!response.ok) return;
        
        const data = await response.json();
        if (data?.Fooddata?.length) {
          // Map backend data to frontend format
          const frontendItems = data.Fooddata.map(item => ({
            id: generateId(), // Guaranteed unique ID
            quantity: 1, // Default as we don't store this
            measurement: 'serving', // Default
            food_name: item.name,
            food_type: 'fooditem',
            dateTime: new Date().toLocaleString({ hour12: true }),
            food_info: {icon: '🍽️'},
            nutrition: {
              calories: item.calories,
              protein: item.protein,
              carbs: item.carbs,
              fats: item.fat,
              fiber: 0 // Not stored in backend
            }
          }));
          setintakeFoodHistoryData(frontendItems);

          // Also sync to localStorage
          const foodHistoryKey = `intakeFoodHistory_${currentUser.uid}`;
          localStorage.setItem(foodHistoryKey, JSON.stringify(frontendItems));
        }
      } catch (err) {
        console.error('Error loading food data:', err);
      }
    };

    loadExistingData();
  }, [currentUser]);

  const handleIntakeFoodAnalyzed = async (data) => {
    if(data.measurement === null || data.quantity === null || data.quantity === "" || data.measurement === "" || Number(data.quantity) === 0 || Number(data.quantity) <= 0) {
      setSnackBar(true);
      setSnackBarMsg('Please enter a valid quantity and measurement');
      return;
    }

    // Get food data from our database
    const foodData = foodDataByKey[data.food_name.toLowerCase()];
    if (!foodData) {
      setSnackBar(true);
      setSnackBarMsg('Food not found in nutrition database');
      return;
    }

    function nutrientCalculator(measurement, quantity, nutrient) {
      let nutrientValue = 0;
      const matchingMeasurement = foodData.measurements.find(m => m.measurement === measurement);
      
      if (matchingMeasurement) {
        if (matchingMeasurement.type === 'weight' && nutrient === 'calories') {
          nutrientValue = matchingMeasurement.caloriesPerGram;
        } else if (matchingMeasurement.type === 'weight' && nutrient === 'protein') {
          nutrientValue = matchingMeasurement.proteinPerGram;
        } else if (matchingMeasurement.type === 'weight' && nutrient === 'carbs') {
          nutrientValue = matchingMeasurement.carbsPerGram;
        } else if (matchingMeasurement.type === 'weight' && nutrient === 'fats') {
          nutrientValue = matchingMeasurement.fatsPerGram;
        } else if (matchingMeasurement.type === 'weight' && nutrient === 'fiber') {
          nutrientValue = matchingMeasurement.fiberPerGram;
        } else {
          nutrientValue = matchingMeasurement[nutrient];
        }
      }
      return nutrientValue * quantity;
    }

    // Structure the frontend item
    const structuredData = {
      id: generateId(),
      quantity: data.quantity,
      measurement: data.measurement,
      food_name: data.food_name,
      food_type:'fooditem',
      dateTime: new Date().toLocaleString(),
      food_info: {icon: '🍽️'},
      nutrition:{
        calories: nutrientCalculator(data.measurement, data.quantity, "calories"),
        protein: nutrientCalculator(data.measurement, data.quantity, "protein"),
        carbs: nutrientCalculator(data.measurement, data.quantity, "carbs"),
        fats: nutrientCalculator(data.measurement, data.quantity, "fats"),
        fiber: nutrientCalculator(data.measurement, data.quantity, "fiber"),
      }
    };

    // Update frontend state
    setintakeFoodHistoryData(prev => [...prev, structuredData]);
    
    // Update localStorage
    const foodHistoryKey = `intakeFoodHistory_${currentUser.uid}`;
    const savedFoodHistory = localStorage.getItem(foodHistoryKey);
    const updatedHistory = savedFoodHistory && savedFoodHistory !== "[]" 
      ? [...JSON.parse(savedFoodHistory), structuredData]
      : [structuredData];
    localStorage.setItem(foodHistoryKey, JSON.stringify(updatedHistory));

    // Show success message
    setSnackBar(true);
    setSnackBarMsg(
      `${data.quantity} ${data.measurement} of ${data.food_name} added it is of ${structuredData.nutrition.calories} calories`
    );

    // Save single item to backend using atomic push
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/data/addFood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser?.uid || currentUser?.displayName || currentUser?.email,
          date: new Date().toISOString().slice(0, 10),
          foodItem: {
            name: data.food_name,
            calories: structuredData.nutrition.calories,
            protein: structuredData.nutrition.protein,
            carbs: structuredData.nutrition.carbs,
            fat: structuredData.nutrition.fats
          }
        })
      });

      if (!response.ok) {
        const txt = await response.text();
        console.error('Failed to save food item:', txt);
        setSnackBar(true);
        setSnackBarMsg('Failed to save to server: ' + txt);
      }
    } catch (err) {
      console.error('Error saving food item:', err);
      setSnackBar(true);
      setSnackBarMsg('Error saving to server: ' + err.message);
    }
  };

  const [footItem, setFootItem] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [measurementDisable, setMeasurementDisable] = useState(true);
  const [quantityDisable, setquantityDisable] = useState(true);
  const handleFoodSelection = (data) => {
    setFootItem(data);
    setMeasurement(null);
    setMeasurementDisable(data === null ? true : false);
    setquantityDisable((data === null) || (data === "")|| (measurement === "" || measurement === null) ? true : false);
  };
  const handleMeasurementSelection = (data) => {
    setMeasurement(data);
    setquantityDisable((data === null) || (data === "") ? true : false);

  };
  return (
    <div className="flex flex-col text-white text-left">
      <h2 className="text-white text-left font-semibold">Food Tracker</h2>
      <p className="text-white text-left font-semibold">
        Add food to track your intake
      </p>
      <div className="flex flex-col md:flex-row gap-4 tracker-layout">
        <div className="flex-1 mt-5">
          <AutoCompleteComponent
            optionsList={Object.keys(foodDataByKey)}
            label={"Select Food Item"}
            handleSelect={handleFoodSelection}
            value={footItem}
          />
          <AutoCompleteComponent
            optionsList={foodDataByKey[footItem]?.measurements.map((e) => {
              return e.measurement;
            })}
            handleSelect={handleMeasurementSelection}
            value={measurement}
            measurementDisable={measurementDisable}
            label={"Select Measurement"}
          />

          <Card
            variant="outlined"
            sx={{
              minWidth: 275,
              borderRadius: 4,
              borderLeft: "4px solid #2196f3",
              background: "rgba(29, 78, 216, 0.15)",
              marginTop: "20px",
            }}
          >
            <CardContent className="flex flex-col">
              <h2 className="font-semibold pb-2 text-white text-left">
                Select Quantity
              </h2>
              <TextField
               
                variant="outlined"
                type="number"
                inputRef={foodQuantityRef}
                disabled={quantityDisable}
                sx={{
                  // Target the text inside the input field
                  "& .MuiInputBase-input": {
                    color: "white",
                  },
                  "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "#747474", // Your desired disabled color
                    },
                  "& .MuiFormLabel-root.Mui-disabled": {
                    color: "#747474", // Your desired disabled color
                  },
                  // Target the label text
                  "& .MuiInputLabel-root": {
                    color: "#aab4c2", // A lighter grey for the label
                  },
                  // Target the label text when focused
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#2196f3", // Blue color on focus
                  },
                  // Target the border of the input
                  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(33, 150, 243, 0.5)",
                  },
                  // Change border on hover
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "#2196f3",
                    },
                  // Change border when focused
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "#2196f3",
                    },
                }}
              />
            </CardContent>
          </Card>
          <Button
            variant="contained"
            sx={{
              borderRadius: "12px",
              fontSize: "12px",
              padding: "4px 12px",
              marginTop: "10px",
            }}
            onClick={() => {
              handleIntakeFoodAnalyzed({
                food_name: footItem,
                measurement,
                quantity: foodQuantityRef.current.value,
              });
            }}
          >
            Submit{" "}
          </Button>
        </div>
        <div className="flex-1 mt-5">
          <IntakeHistory 
          food_type='food'
          intakeHistoryData={intakeFoodHistoryData}
           setintakeHistoryData={setintakeFoodHistoryData} setSnackBar={setSnackBar} setSnackBarMsg={setSnackBarMsg}
           />
        </div>
      </div>
    </div>
  );
};

export default FoodTracker;
