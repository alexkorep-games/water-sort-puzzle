document.addEventListener('DOMContentLoaded', () => {
    const tubesContainer = document.getElementById('tubes-container');
    const movesLeftSpan = document.getElementById('moves-left');
    const resetButton = document.getElementById('reset-button');
    const winMessageDiv = document.getElementById('win-message');
    const nextLevelButton = document.getElementById('next-level-button');

    const TUBE_CAPACITY = 4;
    const MAX_MOVES = 48; // Initial moves like in the video

    let tubesData = []; // Array of arrays, each inner array holds colors ['red', 'blue', ...] from bottom up
    let selectedTubeIndex = -1;
    let movesLeft = MAX_MOVES;
    let currentLevel = 0; // To potentially load different levels later

    // --- Level Definitions ---
    // Define different initial configurations here
    const levels = [
        // Level 0 (similar to video start)
        [
            ['blue', 'cyan', 'pink', 'red'],      // Tube 0
            ['yellow', 'pink', 'cyan', 'blue'],   // Tube 1
            ['pink', 'green', 'red', 'cyan'],     // Tube 2
            ['blue', 'blue', 'green', 'cyan'],    // Tube 3
            ['yellow', 'red', 'green', 'black'],  // Tube 4 (Using 'black' for the dark color, adjust if needed)
            ['blue', 'cyan', 'red', 'black'],     // Tube 5
            ['yellow'],                           // Tube 6 (Partially filled yellow)
            []                                    // Tube 7 (Empty)
            // Note: Video has 8 tubes, the last one empty. Colors might need slight adjustment based on exact shades.
            // Replace 'black' with actual color name if available, e.g., 'grey' or 'darkred'
        ],
        // Add more levels here as arrays of tube data
        [ // Level 1 - A simpler example
            ['red', 'blue'],
            ['red', 'blue'],
            [],
            []
        ]
    ];

    function getTubeTopColor(tubeIndex) {
        const tube = tubesData[tubeIndex];
        return tube.length > 0 ? tube[tube.length - 1] : null;
    }

    function getTubeSpace(tubeIndex) {
        return TUBE_CAPACITY - tubesData[tubeIndex].length;
    }

    function renderTubes() {
        tubesContainer.innerHTML = ''; // Clear previous tubes
        tubesData.forEach((tubeContent, index) => {
            const tubeDiv = document.createElement('div');
            tubeDiv.classList.add('tube');
            tubeDiv.dataset.index = index; // Store index for click handling

            tubeContent.forEach(color => {
                const liquidDiv = document.createElement('div');
                liquidDiv.classList.add('liquid', `color-${color}`);
                // liquidDiv.textContent = color; // Optional: display color name
                tubeDiv.appendChild(liquidDiv);
            });

            // Add empty space visualization (optional, helps understanding capacity)
            // for (let i = 0; i < TUBE_CAPACITY - tubeContent.length; i++) {
            //     const emptyDiv = document.createElement('div');
            //     emptyDiv.classList.add('liquid', 'empty-space'); // Style .empty-space if needed
            //     tubeDiv.appendChild(emptyDiv);
            // }


            if (index === selectedTubeIndex) {
                tubeDiv.classList.add('selected');
            }

            tubeDiv.addEventListener('click', handleTubeClick);
            tubesContainer.appendChild(tubeDiv);
        });

        movesLeftSpan.textContent = movesLeft;
        checkWinCondition(); // Check win after every render
    }

    function handleTubeClick(event) {
        const clickedTubeIndex = parseInt(event.currentTarget.dataset.index);

        if (winMessageDiv.classList.contains('hidden') === false) return; // Don't allow clicks if game won

        if (selectedTubeIndex === -1) {
            // If no tube is selected, try to select the clicked one
            if (tubesData[clickedTubeIndex].length > 0) {
                selectedTubeIndex = clickedTubeIndex;
                renderTubes(); // Re-render to show selection
            }
        } else {
            // A tube is already selected, try to pour
            if (selectedTubeIndex !== clickedTubeIndex) {
                tryPour(selectedTubeIndex, clickedTubeIndex);
            }
            // Deselect after attempt (whether successful or not)
            selectedTubeIndex = -1;
            renderTubes(); // Re-render to remove selection / show result of pour
        }
    }

    function tryPour(sourceIndex, destinationIndex) {
        if (movesLeft <= 0) return; // No more moves

        const sourceTube = tubesData[sourceIndex];
        const destTube = tubesData[destinationIndex];

        if (sourceTube.length === 0) return; // Cannot pour from empty tube

        const sourceColor = getTubeTopColor(sourceIndex);
        const destColor = getTubeTopColor(destinationIndex);
        const availableSpace = getTubeSpace(destinationIndex);

        if (availableSpace === 0) return; // Destination tube is full

        if (destColor !== null && sourceColor !== destColor) {
            return; // Colors don't match
        }

        // Find how much liquid of the same color is on top of the source tube
        let amountToPour = 0;
        let pourColor = sourceTube[sourceTube.length - 1];
        for (let i = sourceTube.length - 1; i >= 0; i--) {
            if (sourceTube[i] === pourColor) {
                amountToPour++;
            } else {
                break; // Stop if a different color is encountered
            }
        }

        // Limit pour amount by available space in destination
        amountToPour = Math.min(amountToPour, availableSpace);

        // Perform the pour
        if (amountToPour > 0) {
            for (let i = 0; i < amountToPour; i++) {
                destTube.push(sourceTube.pop());
            }
            movesLeft--; // Decrement moves only on successful pour
            // Add sound effect here if desired
        }
    }

    function checkWinCondition() {
        if (tubesData.length === 0) return false; // No tubes yet

        for (const tube of tubesData) {
            if (tube.length === 0) continue; // Empty tube is valid

            if (tube.length < TUBE_CAPACITY && tube.length > 0) {
                 // Partially filled tube means not won UNLESS all tubes are either empty or complete
                 // More precise check: if ANY tube is partially filled AND not monochromatic, it's not a win
                 if (tube.length > 0 && new Set(tube).size > 1) {
                     return false; // Mixed colors in a non-empty tube
                 }
                 if (tube.length < TUBE_CAPACITY) {
                    // Allow partially full tubes ONLY IF they are monochromatic
                    // Need to check if ALL other tubes are valid (empty or full+monochromatic)
                    // Let's simplify: A win requires all non-empty tubes to be full and monochromatic
                     return false; // Simplification: Require non-empty tubes to be full
                 }
            }


            if (tube.length === TUBE_CAPACITY) {
                 // Check if all colors in a full tube are the same
                 const firstColor = tube[0];
                 if (!tube.every(color => color === firstColor)) {
                     return false; // Full tube but mixed colors
                 }
            }
        }

        // If we got here, all tubes are either empty or full with a single color
        console.log("Win condition met!");
        winMessageDiv.classList.remove('hidden');
        return true;
    }

    function resetGame() {
        // Load the current level's data
        // Use slice() for deep copy if modifying levels, but here we just reload
        if (currentLevel >= levels.length) {
            console.warn("No more levels defined, resetting to level 0");
            currentLevel = 0;
        }
        // Deep copy the level data to avoid modifying the original level definition
        tubesData = JSON.parse(JSON.stringify(levels[currentLevel]));

        // Ensure all tubes exist, even if empty in definition (pad with empty tubes if needed)
        // const requiredTubes = 8; // Or calculate based on level
        // while (tubesData.length < requiredTubes) {
        //     tubesData.push([]);
        // }

        selectedTubeIndex = -1;
        movesLeft = MAX_MOVES; // Reset moves
        winMessageDiv.classList.add('hidden'); // Hide win message
        renderTubes();
    }

    function loadNextLevel() {
        currentLevel++;
        resetGame(); // ResetGame now loads the new currentLevel
    }

    // Event Listeners
    resetButton.addEventListener('click', resetGame);
    nextLevelButton.addEventListener('click', loadNextLevel); // Or just resetGame if you only have one level

    // --- Initial Game Setup ---
    resetGame(); // Start the first level

});