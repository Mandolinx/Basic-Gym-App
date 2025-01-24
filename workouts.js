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
    onValue(workouts, function(snapshot) {
        if (snapshot.exists()) {
            let itemsArr = Object.entries(snapshot.val());
            console.log(itemsArr)
            // Assuming we're processing only the first workout for now
            for (let key in itemsArr){
                const workoutName = itemsArr[key][0];
                const workoutDetails = itemsArr[key][1];
                console.log(workoutDetails)
                addWorkouts(workoutName, workoutDetails);
            };
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

function addWorkouts(workoutName, workoutDetails) {
    // Use insertAdjacentHTML to append new workout links
    templateEl.insertAdjacentHTML(
        "beforeend",
        `
        <a href="currWorkout.html" class="workout">
            <h3>${formatCamelCase(workoutName)}</h3>
        </a>
        `
    );

    // Select the newly added workout element
    const workoutEls = templateEl.querySelectorAll(".workout");
    const workoutEl = workoutEls[workoutEls.length - 1]; // Get the last added workout element

    // Attach event listener to the new workout
    workoutEl.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link navigation
        localStorage.setItem("selectedWorkout", workoutName);
        console.log(`Workout '${workoutName}' stored in localStorage`);
        window.location.href = workoutEl.getAttribute("href"); // Manually navigate to the link
    });

    // Add workout details dynamically
    for (let key in workoutDetails) {
        workoutEl.insertAdjacentHTML(
            "beforeend",
            `
            <p>${workoutDetails[key].sets} x ${formatCamelCase(key)}</p>
            `
        );
    }
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
