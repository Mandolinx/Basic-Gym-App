import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import * as workoutFuncs from "./firebaseFuncs.js";


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

const templateEl = document.querySelector(".template");
if (!templateEl) {
    console.error("Element '.exercise' not found in the DOM.");
}

function setupListeners(workouts) {
    onValue(workouts, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val(); // Get the workouts array
            console.log("Workouts:", data);
    
            // Clear the UI and display each workout
            templateEl.innerHTML = "";
            data.workouts.forEach((workout) => {
                workoutFuncs.addWorkouts(workout.name, workout.exercises); // Pass workout name and its exercises
            });
        } else {
            console.log("No data found in database");
        }
    });
}

const addWorkoutBtn = document.getElementById("add-workout-btn");
addWorkoutBtn.addEventListener("click", () => {
    templateEl.style.display = "none";
    const addWorkout = document.getElementById("new-exercise");
    addWorkout.innerHTML = `
    <input type="text" placeholder="New Exercise Name" class="new-exercise-name">
    <button class="new-exercise-name-btn">Add Exercise</button>`;
    const newExerciseNameEl = document.querySelector(".new-exercise-name");
    const newExerciseNameBtn = document.querySelector(".new-exercise-name-btn");
    newExerciseNameBtn.addEventListener("click", () => {
        const baseTemplate = {
            name: newExerciseNameEl.value,
            sets: "1",
            reps: "",
            weight: ""
        };    
        workoutFuncs.addExercises(newExerciseNameEl.value, baseTemplate);
        newExerciseNameEl.remove();
        newExerciseNameBtn.remove();
    })




})
const baseTemplate = {
    name: "",
    sets: "1",
    reps: "",
    weight: ""
};



