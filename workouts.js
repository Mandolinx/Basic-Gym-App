import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
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
            let data = snapshot.val(); // Get the workouts array
            data = Object.values(data)
            console.log("Workouts:", data);
    
            // Clear the UI and display each workout
            templateEl.innerHTML = "";
            data.forEach((workout) => {
                workoutFuncs.addWorkouts(workout.name, workout.exercises); // Pass workout name and its exercises
            });
        } else {
            console.log("No data found in database");
        }
    });


    addNewWorkoutEl.addEventListener("click", () => {
        const exerciseEl = document.querySelector(".exercise");
        const workoutName = document.querySelector("#workout-name").value;
    
        if (exerciseEl.innerHTML.trim() === "") {  // Trim to avoid false positives from whitespace
            document.querySelector("#add-workout").style.display = "none";
            templateEl.style.display = "flex";
        }
        else {
            let exercises = getWorkoutData();
            const fetchedWorkout = {
                "exercises": exercises,
                "name": workoutName
            };
            push(workouts, fetchedWorkout)
            .then(() => console.log("Workout added successfully:", fetchedWorkout))
            .catch((error) => console.error("Error adding workout:", error));
            document.querySelector("#add-workout").style.display = "none";
            templateEl.style.display = "flex";
        }
    });
}

const addWorkoutBtn = document.getElementById("add-workout-btn");
addWorkoutBtn.addEventListener("click", () => {
    document.querySelector("#add-workout").style.display = "block";
    // hide other workouts
    templateEl.style.display = "none";
    const newExerciseEl = document.getElementById("new-exercise");
    // make new inputs and button for new workout adding 
    newExerciseEl.innerHTML = `
    <input type="text" placeholder="New Exercise Name" class="new-exercise-name">
    <button class="new-exercise-name-btn">Add Exercise</button>`;
    const newExerciseNameEl = document.querySelector(".new-exercise-name");
    const newExerciseNameBtn = document.querySelector(".new-exercise-name-btn");
    newExerciseNameBtn.addEventListener("click", () => {
        const workoutName = document.querySelector("#workout-name").value;
        if (newExerciseNameEl.value == "" || workoutName == "") return;
        const baseTemplate = {
            name: newExerciseNameEl.value,
            sets: "1",
            reps: "",
            weight: ""
        };    
        workoutFuncs.addExercises(newExerciseNameEl.value, baseTemplate, true);
        newExerciseNameEl.remove();
        newExerciseNameBtn.remove();
    })
})

const addNewWorkoutEl = document.getElementById("add-new-workout");

function getWorkoutData() {
    const exerciseSections = document.querySelectorAll(".exercise-section");
    const exercises = [];

    exerciseSections.forEach((section) => {
        const exerciseName = section.querySelector("h3").textContent.trim();

        const sets = [];
        const setElements = section.querySelectorAll(".set");
        setElements.forEach((setEl) => {
            const weight = setEl.querySelector("input[type='number']").value;
            const reps = setEl.querySelectorAll("input[type='number']")[1].value;
            sets.push({
                weight: parseFloat(weight),
                reps: parseInt(reps),
            });
        });

        if (sets.length > 0) {
            exercises.push({
                name: exerciseName.replace(/\s/g, ""), // Convert to camelCase format
                sets: sets.length,
                weight: sets[0].weight, // Assuming first set weight is standard
                reps: sets[0].reps, // Assuming first set reps is standard
            });
        }
    });

    return exercises;
}







