import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import * as workoutFuncs from "./firebaseFuncs.js";

const exitButton = document.getElementById("exit-button");
const finishBtn = document.getElementById("finish");
let workoutData = [];
let workoutKey = null; // Will store the Firebase key of the workout

// Initialize Firebase
fetch('firebase-key.json')
  .then(response => response.json())
  .then(data => {
    const appSettings = { databaseURL: data.databaseURL };
    const app = initializeApp(appSettings);
    const database = getDatabase(app);
    const workoutsRef = ref(database, "workouts");

    setupListeners(database, workoutsRef);
  })
  .catch(error => console.error('Error loading config:', error));

const exerciseEl = document.querySelector(".exercise");
if (!exerciseEl) {
    console.error("Element '.exercise' not found in the DOM.");
}

function setupListeners(database, workoutsRef) {
    const selectedWorkout = localStorage.getItem("selectedWorkout");
    if (!selectedWorkout) {
        console.error("No workout selected in localStorage!");
        return;
    }

    onValue(workoutsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const workoutEntries = Object.entries(data); // Convert object to array of [key, value]

            // Find the workout and get its key
            const foundWorkout = workoutEntries.find(([key, workout]) => workout.name === selectedWorkout);

            if (!foundWorkout) {
                console.error(`No data found for workout: ${selectedWorkout}`);
                return;
            }

            // Extract the workout key and workout data
            workoutKey = foundWorkout[0]; // Key of the workout
            const currentWorkout = foundWorkout[1]; // Workout object

            console.log(`Workout Key: ${workoutKey}`);
            console.log(`Exercises for ${selectedWorkout}:`, currentWorkout.exercises);

            // Clear previous exercises and render new ones
            exerciseEl.innerHTML = "";
            currentWorkout.exercises.forEach((exercise) => {
                workoutFuncs.addExercises(exercise.name, exercise);
            });

            workoutData = workoutFuncs.getWorkoutData();
        } else {
            console.log("No data found in database");
        }
    });
}

// Update workout on "Finish" button click
finishBtn.addEventListener("click", () => {
    
    if (!workoutKey) {
        console.error("Workout key is missing! Cannot update.");
        return;
    }

    const postWorkoutData = workoutFuncs.getWorkoutData();
    if (!workoutFuncs.areExercisesEqual(postWorkoutData, workoutData)){
        const updateEl = document.getElementById("updated-workout");
        updateEl.style.display = "flex";

    }
    else{
        window.location='index.html';
    }
});

const closeUpdateValues = document.getElementById("close-update-workout");
const updateValuesBtn = document.getElementById("update-values");


closeUpdateValues.addEventListener("click", () => {
    const updateEl = document.getElementById("updated-workout");
    updateEl.style.display = "none";
    exerciseEl.style.display = "block"
})

updateValuesBtn.addEventListener("click", () => {
    const postWorkoutData = workoutFuncs.getWorkoutData();
    const database = getDatabase();
    const workoutRef = ref(database, `workouts/${workoutKey}`);

    update(workoutRef, { exercises: postWorkoutData })
        .then(() => console.log("Workout updated successfully"))
        .catch(error => console.error("Error updating workout:", error));
    window.location='index.html';
})

// Start the timer
workoutFuncs.timer();
