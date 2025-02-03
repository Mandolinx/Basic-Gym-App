export function formatCamelCase(str) {
    const spacedString = str.replace(/([A-Z])/g, " $1");
    return spacedString
        .trim()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export const exerciseHeader = (exerciseName, exerciseDetails, removal = false) => {
    const exerciseEl = document.querySelector(".exercise");
    let exerciseHTML;
    if (removal){
        exerciseHTML = `
            <div class="exercise-section">
                <div class="removal-exercise">
                <h3>${formatCamelCase(exerciseName)}</h3>
                <button class="removal">X</button>
                </div>
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
    }
    else{
        exerciseHTML = `
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
    }
    return exerciseHTML 
}
 
export const addExercises = (exerciseName, exerciseDetails, removal=false) => {
    console.log(exerciseDetails);
    const exerciseEl = document.querySelector(".exercise");
    const exerciseHTML = exerciseHeader(exerciseName, exerciseDetails, removal);

    // Append the new exercise section
    exerciseEl.insertAdjacentHTML('beforeend', exerciseHTML);

    // Add sets dynamically to the latest exercise section
    const exerciseSection = exerciseEl.querySelector(".exercise-section:last-child");
    const gridContainer = exerciseSection.querySelector(".grid-container");
    const addSetButton = exerciseSection.querySelector(".add-set");

    // Populate initial sets
    function populateSets(setAmount) {
        for (let i = 0; i < setAmount; i++) {
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
    }
    


    // Initial population of sets
    populateSets(exerciseDetails.sets);
    
    gridContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("set-num")) {
            // Find the clicked set
            const clickedSet = e.target.closest(".set");
    
            // Remove the clicked set from the DOM
            clickedSet.remove();
    
            // Update the ordering of the remaining sets
            const remainingSets = gridContainer.querySelectorAll(".set");
            remainingSets.forEach((set, index) => {
                // Update the set-num value to reflect the new order
                const setNumElement = set.querySelector(".set-num");
                setNumElement.textContent = index + 1; // Reassign based on new index
            });
        }
        });
    
    if (removal){
        const removalButton = exerciseEl.querySelector(".exercise-section:last-child .removal");
        removalButton.addEventListener("click", (e) => {
            exerciseSection.remove();
        })
    }


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

}



export function addWorkouts(workoutName, exercises) {
    const templateEl = document.querySelector(".template");
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

export function areExercisesEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;

    return arr1.every((exercise, index) => {
        const otherExercise = arr2[index];
        return exercise.name === otherExercise.name &&
               exercise.reps === otherExercise.reps &&
               exercise.sets === otherExercise.sets &&
               exercise.weight === otherExercise.weight;
    });
}

export function getWorkoutData() {
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

// const update

export function timer() {
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