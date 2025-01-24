import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

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


    onValue(workouts, function(snapshot) {

        const selectedWorkout = localStorage.getItem("selectedWorkout");
        if (!selectedWorkout) {
            console.error("No workout selected in localStorage!");
            return;
        }
        
        if (snapshot.exists()) {
            const data = snapshot.val(); // Get the entire workouts object from Firebase
            const currentItem = data[selectedWorkout]; // Use selectedWorkout as the key
        
            if (!currentItem) {
                console.error(`No workout data found for key: ${selectedWorkout}`);
                return;
            }
        
            console.log(`Current workout data for ${selectedWorkout}:`, currentItem);
        
            const exercises = Object.entries(currentItem); // Convert the exercises to an array of key-value pairs
            clearExercises(); // Clear previous exercises
            exercises.forEach(([exerciseName, exerciseDetails]) => {
                addExercises(exerciseName, exerciseDetails); // Add each exercise to the UI
            });
        } else {
            console.log("No data from realtime database");
        }
    });
}   

function formatCamelCase(str) {
    const spacedString = str.replace(/([A-Z])/g, " $1");
    return spacedString
        .trim()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function addExercises(exerciseName, exerciseDetails) {
    const exerciseHTML = `
        <div class="exercise-section">
            <h3>${formatCamelCase(exerciseName)}</h3>
            <div class="grid-container">
                <div class="exercise-header">
                    <span class="header">Set</span>
                    <span class="header">KG</span>
                    <span class="header">REPS</span>
                    <span></span>
                </div>
            </div>
        </div>
    `;

    // Append the new exercise section
    exerciseEl.innerHTML += exerciseHTML;

    // Add sets dynamically
    const gridContainer = exerciseEl.querySelector(".exercise-section:last-child .grid-container");
    for (let i = 0; i < exerciseDetails.sets; i++) {
        const setDetails = `
            <div class="set">
                <span class="row">${i + 1}</span>
                <input type="number" min="0" value="${exerciseDetails['weight']}">
                <input type="number" min="0" step="1" value="${exerciseDetails['reps']}">
                <input type="checkbox" value="exercise-${i + 1}-done">
            </div>
        `;
        gridContainer.innerHTML += setDetails;
    }
}

function clearExercises() {
    exerciseEl.innerHTML = "";
}
