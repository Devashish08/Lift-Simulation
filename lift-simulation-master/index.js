var siteWidth = 1280;
var scale = screen.width / siteWidth;

document
  .querySelector('meta[name="viewport"]')
  .setAttribute(
    "content",
    "width=" + siteWidth + ", initial-scale=" + scale + ""
  );

// index.html
async function loadHtml(file, elementId) {
  await fetch(file)
    .then((response) => response.text())
    .then((data) => (document.getElementById(elementId).innerHTML = data))
    .catch((error) => console.error(`Error loading ${file}: ${error}`));
}

// instructions.html
document.addEventListener("DOMContentLoaded", async () => {
  await loadHtml("instructions.html", "main-content");

  // Load instructions
  const instructions = [
    "Enter the number of floors and lifts to simulate the lift system.",
    "Click the 'Start Simulation' button to start the simulation.",
    "Click any floor 'up' or 'down' button to call the lift.",
  ];

  const instructionsList = document.getElementById("instructions-list");
  instructions.forEach((instruction) => {
    const li = document.createElement("li");
    li.textContent = instruction;
    instructionsList.appendChild(li);
  });

  // Load lift system form interaction
  const liftSystemForm = document.getElementById("lift-system-form");

  liftSystemForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const totalFloors = parseInt(
      document.getElementById("total-floors-input").value
    );
    const totalLifts = parseInt(
      document.getElementById("total-lifts-input").value
    );

    if (totalFloors < 2 && totalFloors > 50) {
      alert("Number of floors should between 2 and 50");
      return;
    }
    if (totalLifts < 1 && totalFloors > 50) {
      alert("Number of lifts should between 1 and 50");
      return;
    }

    loadLiftSimulation(totalFloors, totalLifts);
  });
});

// lift-simulation.html
async function loadLiftSimulation(totalFloors, totalLifts) {
  await loadHtml("lift-simulation.html", "main-content");

  const liftSimulationPara = document.getElementById("lift-simulation-para");
  liftSimulationPara.textContent = `Lift Simulation with ${totalFloors} floors and ${totalLifts} lifts`;

  // Create building
  generateBuilding(totalFloors, totalLifts);

  // Initialize lift system
  new LiftSystem(totalFloors, totalLifts);
}

function generateBuilding(totalFloors, totalLifts) {
  const building = document.getElementById("building");
  building.innerHTML = "";

  for (let floor = totalFloors - 1; floor >= 0; floor--) {
    const floorDiv = document.createElement("div");
    floorDiv.className = "floor";

    // Floor number
    const floorNumberDiv = document.createElement("div");
    floorNumberDiv.className = "floor-number";
    if (floor === 0) {
      floorNumberDiv.innerHTML = `0th Floor`;
    } else if (floor === 1) {
      floorNumberDiv.innerHTML = `${floor}st Floor`;
    } else if (floor === 2) {
      floorNumberDiv.innerHTML = `${floor}nd Floor`;
    } else if (floor === 3) {
      floorNumberDiv.innerHTML = `${floor}rd Floor`;
    } else {
      floorNumberDiv.innerHTML = `${floor}th Floor`;
    }

    floorDiv.appendChild(floorNumberDiv);

    // Floor control system
    const floorControl = `
      <div class="floor-lift-control">
        ${
          floor !== totalFloors - 1
            ? ` <div class="floor-lift-control-up">
                  <div class="floor-lift-control-screen"></div>
                  <button class="floor-lift-control-button" data-floor=${floor} data-direction="up">▲</button>
                </div>`
            : ""
        }
        ${
          floor !== 0
            ? ` <div class="floor-lift-control-down">
                  <div class="floor-lift-control-screen"></div>
                  <button class="floor-lift-control-button" data-floor=${floor} data-direction="down">▼</button>
                </div>`
            : ""
        }
      </div>`;

    floorDiv.innerHTML += floorControl;

    // Floor lifts
    const floorLiftsDiv = document.createElement("div");
    floorLiftsDiv.className = "floor-lifts";

    for (let lift = 1; lift <= totalLifts; lift++) {
      const floorLiftDiv = document.createElement("div");
      floorLiftDiv.className = "floor-lift";
      if (floor === 0) {
        floorLiftDiv.innerHTML = `
        <div class="lift" id="lift-${lift}">
            <div class="lift-door-screen">
                <div class="lift-door-screen-up"></div>
                <div class="lift-door-screen-text"></div>
                <div class="lift-door-screen-down"></div>
            </div>
            <div class="lift-door">
                <div class="lift-door-left"></div>
                <div class="lift-door-right"></div>
            </div>
        </div>`;
      }
      floorLiftsDiv.appendChild(floorLiftDiv);
    }

    floorDiv.appendChild(floorLiftsDiv);

    // Append floor to building
    building.appendChild(floorDiv);
  }
}
