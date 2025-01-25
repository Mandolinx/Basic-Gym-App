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

    const selectedWorkout = localStorage.getItem("selectedWorkout");
    if (!selectedWorkout) {
        console.error("No workout selected in localStorage!");
        return;
    }
    
    onValue(workouts, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val(); // Get the workouts array
            const currentWorkout = data.workouts.find(workout => workout.name === selectedWorkout); // Find selected workout
    
            if (!currentWorkout) {
                console.error(`No data found for workout: ${selectedWorkout}`);
                return;
            }
    
            console.log(`Exercises for ${selectedWorkout}:`, currentWorkout.exercises);
    
            clearExercises(); // Clear any existing exercises in the UI
            currentWorkout.exercises.forEach((exercise) => {
                addExercises(exercise.name, exercise); // Add each exercise
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

const addExercises = (exerciseName, exerciseDetails) => {
    const exerciseHTML = `
        <div class="exercise-section">
            <h3>${formatCamelCase(exerciseName)}</h3>
            <div class="grid-container">
                <div class="exercise-header">
                    <span class="header">SET</span>
                    <span class="header">PREVIOUS</span>
                    <span class="header">KG</span>
                    <span class="header">REPS</span>
                    <span></span>
                </div>
            </div>
            <button class="add-set">ADD SET</button>
        </div>
    `;

    // Append the new exercise section
    exerciseEl.insertAdjacentHTML('beforeend', exerciseHTML);

    // Add sets dynamically to the latest exercise section
    const exerciseSection = exerciseEl.querySelector(".exercise-section:last-child");
    const gridContainer = exerciseSection.querySelector(".grid-container");
    const addSetButton = exerciseSection.querySelector(".add-set");

    // Populate initial sets
    for (let i = 0; i < exerciseDetails.sets; i++) {
        const setDetails = `
            <div class="set">
                <span class="set-num row">${i + 1}</span>
                <span class="row">${exerciseDetails['weight']}kg x ${exerciseDetails['reps']}</span>
                <input type="number" min="0" value="${exerciseDetails['weight']}">
                <input type="number" min="0" step="1" value="${exerciseDetails['reps']}">
                <input type="checkbox" value="exercise-${i + 1}-done">
            </div>
        `;
        gridContainer.insertAdjacentHTML('beforeend', setDetails);
    }
    gridContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("set-num")) {
            const setEl = e.target.closest(".set");
            if (setEl) {
                setEl.remove();
            }
        }
    });

    // Add event listener to the ADD SET button
    addSetButton.addEventListener("click", () => {
        // Count current sets in this specific exercise section
        const currentSetCount = gridContainer.querySelectorAll(".set").length;

        // Create a new set row
        const newSetDetails = `
            <div class="set">
                <span class="set-num row">${currentSetCount + 1}</span>
                <span class="row">${exerciseDetails['weight']}kg x ${exerciseDetails['reps']}</span>
                <input type="number" min="0" value="${exerciseDetails['weight']}">
                <input type="number" min="0" step="1" value="${exerciseDetails['reps']}">
                <input type="checkbox" value="exercise-${currentSetCount + 1}-done">
            </div>  
        `;

        // Append the new set to the grid container
        gridContainer.insertAdjacentHTML('beforeend', newSetDetails);

    });

};






function clearExercises() {
    exerciseEl.innerHTML = "";
}

function timer() {
    const timerEl = document.querySelector(".top-bar p");
    let sec = 0;
    let minute = 0;
    let hour = 0;

    setInterval(() => {
        sec += 1;

        // Handle minute and hour increments
        if (sec >= 60) {
            sec = 0;
            minute++;
        }
        if (minute >= 60) {
            minute = 0;
            hour++;
        }
        if (hour >= 99) {
            return; // Stop the timer if hours exceed 99
        }

        // Format time to always show two digits
        const formattedTime = [
            hour.toString().padStart(2, '0'),
            minute.toString().padStart(2, '0'),
            sec.toString().padStart(2, '0')
        ].join(':');

        timerEl.textContent = formattedTime;
    }, 1000);
}

// Start the timer
timer();
