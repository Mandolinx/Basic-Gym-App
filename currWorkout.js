import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import * as workoutFuncs from "./firebaseFuncs.js";

const exitButton = document.getElementById("exit-button");

// fetches firebase database key link and initialises basic firebase variables
fetch('firebase-key.json')
  .then(response => response.json())
  .then(data => {
    const appSettings = {
      databaseURL: data.databaseURL
    };

    // Initialize Firebase
    const app = initializeApp(appSettings);
    const database = getDatabase(app);
    const workouts = ref(database, "workouts");
    setupListeners(workouts); // Set up Firebase listeners
  })
  .catch(error => console.error('Error loading config:', error));

const exerciseEl = document.querySelector(".exercise");
if (!exerciseEl) {
    console.error("Element '.exercise' not found in the DOM.");
}

function setupListeners(workouts) {

    const selectedWorkout = localStorage.getItem("selectedWorkout");
    if (!selectedWorkout) {
        console.error("No workout selected in localStorage!");
        return;
    }
    
    onValue(workouts, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val(); // Get the workouts array
            // find selected workout
            const currentWorkout = data.workouts.find(workout => workout.name === selectedWorkout); 
    
            if (!currentWorkout) {
                console.error(`No data found for workout: ${selectedWorkout}`);
                return;
            }
            
            console.log(`Exercises for ${selectedWorkout}:`, currentWorkout.exercises);
    
            exerciseEl.innerHTML = "";
            // render each exercise of the current workout stored in localStorage
            currentWorkout.exercises.forEach((exercise) => {
                workoutFuncs.addExercises(exercise.name, exercise); 
            });
        } else {
            console.log("No data found in database");
        }
    });
    
}   

// Start the timer
workoutFuncs.timer();

