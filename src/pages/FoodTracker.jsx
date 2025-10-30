// src/pages/FoodTracker.jsx
import React, { useState, useRef } from "react";
import { foodDataByKey } from "../foodData";
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

  const handleIntakeFoodAnalyzed = (data) => {
    console.log(data, currentUser);

    // We use the same safe updater pattern here
    let currentData = data;
    let transferSavedDate;
    function nutrientCalculator(measurement, quantity, nutrient) {
      let nutrientValue = 0;
      foodDataByKey[data.food_name].measurements.forEach((e) => {
        if (e.measurement === measurement) {
          nutrientValue = e[nutrient];
        }
      });
      return nutrientValue * quantity;
    }
    const foodHistoryKey = `intakeFoodHistory_${currentUser.uid}`;
    const savedFoodHistory = localStorage.getItem(foodHistoryKey);
    let structuredData = {
      id: Date.now(),
      quantity: data.quantity,
      measurement: data.measurement,
      food_name: data.food_name,
      food_type:'fooditem',
      dateTime: new Date().toLocaleString(),
      food_info: {icon: '🍽️'},
      nutrition:{calories: nutrientCalculator(data.measurement, data.quantity, "calories"),
      protein: nutrientCalculator(data.measurement, data.quantity, "protein"),
      carbs: nutrientCalculator(data.measurement, data.quantity, "carbs"),
      fats: nutrientCalculator(data.measurement, data.quantity, "fats"),
      fiber: nutrientCalculator(data.measurement, data.quantity, "fiber"),}
    };
    if (savedFoodHistory && savedFoodHistory !== "[]") {
      transferSavedDate = JSON.parse(savedFoodHistory);
      transferSavedDate.push(structuredData);
    } else {
      transferSavedDate = [structuredData];
    }
    setintakeFoodHistoryData(transferSavedDate);
    setSnackBar(true);
    setSnackBarMsg(
      `${data.quantity} ${data.measurement} of ${data.food_name} added it is of ${structuredData.nutrition.calories} calories`
    );
    console.log(structuredData);
  };

  const [footItem, setFootItem] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [measurementDisable, setMeasurementDisable] = useState(true);
  const handleFoodSelection = (data) => {
    setFootItem(data);
    setMeasurement(null);
    setMeasurementDisable(data === null ? true : false);
  };
  const handleMeasurementSelection = (data) => {
    setMeasurement(data);
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
                label="Quantity"
                variant="outlined"
                type="number"
                inputRef={foodQuantityRef}
                disabled={measurementDisable}
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
