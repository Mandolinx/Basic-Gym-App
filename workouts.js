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
                addWorkouts(workout.name, workout.exercises); // Pass workout name and its exercises
            });
        } else {
            console.log("No data found in database");
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

function addWorkouts(workoutName, exercises) {
    // Add the workout section to the template
    templateEl.insertAdjacentHTML(
        "beforeend",
        `
        <div class="workout">
            <h3>${formatCamelCase(workoutName)}</h3>
        </div>
        `
    );

    // Get the last added workout element
    const workoutEls = templateEl.querySelectorAll(".workout");
    const workoutEl = workoutEls[workoutEls.length - 1]; // Last added workout

    // Add exercises dynamically
    exercises.forEach((exercise) => {
        workoutEl.insertAdjacentHTML(
            "beforeend",
            `
            <p>${exercise.sets} x ${formatCamelCase(exercise.name)}</p>
            `
        );
    });

    // Attach event listener for storing the selected workout in localStorage
    workoutEl.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default behavior
        localStorage.setItem("selectedWorkout", workoutName); // Store the selected workout
        console.log(`Workout '${workoutName}' stored in localStorage`);
        window.location.href = "currWorkout.html"; // Redirect to currWorkout page
    });
}


function clearExercises() {
    exerciseEl.innerHTML = "";
}
