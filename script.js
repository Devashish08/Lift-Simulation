/** @format */

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-simulation");
  const floorsContainer = document.getElementById("floors-container");
  const liftsContainer = document.getElementById("lifts-container");
  let floors = [];
  let lifts = [];
  let floorHeight = 80; // Height of each floor in pixels

  startButton.addEventListener("click", startSimulation);

  function startSimulation() {
    const numFloors = parseInt(document.getElementById("floors").value);
    const numLifts = parseInt(document.getElementById("lifts").value);

    if (numFloors < 2 || numLifts < 1 || numLifts > 8 || numFloors > 50) {
      alert("Please enter valid numbers for floors (2 - 50) and lifts (1-8).");
      return;
    }

    floorsContainer.innerHTML = "";
    liftsContainer.innerHTML = "";
    floors = [];
    lifts = [];

    createFloors(numFloors);
    createLifts(numLifts);
  }

  function createFloors(numFloors) {
    for (let i = numFloors; i >= 1; i--) {
      const floor = document.createElement("div");
      floor.className = "floor";
      floor.innerHTML = `
        <div class="floor-buttons">
          ${
            i < numFloors
              ? `<button class="floor-button up-button" data-floor="${i}" data-direction="up">Up</button>`
              : ""
          }
          ${
            i > 1
              ? `<button class="floor-button down-button" data-floor="${i}" data-direction="down">Down</button>`
              : ""
          }
        </div>
        <div class="floor-line"></div>
        <div class="floor-number">Floor ${i}</div>
      `;
      floorsContainer.appendChild(floor);
      floors.push(floor);
    }
    addFloorButtonListeners();
  }

  function createLifts(numLifts) {
    const liftWidth = 80; // Width of each lift
    for (let i = 0; i < numLifts; i++) {
      const lift = document.createElement("div");
      lift.className = "lift";
      lift.innerHTML = `
      <div class="lift-doors">
        <div class="lift-door lift-door-left"></div>
        <div class="lift-door lift-door-right"></div>
      </div>
    `;
      lift.style.left = `${i * liftWidth}px`; // Position based on index
      lift.style.bottom = "0px"; // Start at the first floor
      liftsContainer.appendChild(lift);
      lifts.push({
        element: lift,
        currentFloor: 1,
        targetFloors: [],
        isMoving: false
      });
    }
  }

  function addFloorButtonListeners() {
    const floorButtons = document.querySelectorAll(".floor-button");
    floorButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const targetFloor = parseInt(e.target.getAttribute("data-floor"));
        const direction = e.target.getAttribute("data-direction");
        requestLift(targetFloor, direction);
      });
    });
  }

  function requestLift(targetFloor, direction) {
    const availableLifts = lifts.filter((lift) => !lift.isMoving);
    if (availableLifts.length > 0) {
      // Find the nearest available lift
      const nearestLift = availableLifts.reduce((prev, curr) =>
        Math.abs(curr.currentFloor - targetFloor) <
        Math.abs(prev.currentFloor - targetFloor)
          ? curr
          : prev
      );
      nearestLift.targetFloors.push(targetFloor);
      moveLift(nearestLift);
    } else {
      // If no lifts are available, check for idle lifts
      const idleLifts = lifts.filter(
        (lift) => lift.currentFloor === 1 && !lift.isMoving
      );
      if (idleLifts.length > 0) {
        const nearestIdleLift = idleLifts[0]; // Assuming the first idle lift is the nearest
        nearestIdleLift.targetFloors.push(targetFloor);
        moveLift(nearestIdleLift);
      }
    }
  }

  async function moveLift(lift) {
    lift.isMoving = true;
    const targetFloor = lift.targetFloors.shift();
    const translateY = (targetFloor - 1) * floorHeight;
    lift.element.style.transform = `translateY(-${translateY}px)`;
    await wait(2000); // Simulate movement time (2 seconds to reach the destination)

    // Wait until the lift has fully reached the destination floor before opening doors
    await openCloseDoors(lift);

    lift.isMoving = false;

    if (lift.targetFloors.length > 0) {
      moveLift(lift);
    }
  }

  function openCloseDoors(lift) {
    return new Promise((resolve) => {
      lift.element.classList.add("doors-opening");
      setTimeout(() => {
        lift.element.classList.remove("doors-opening");
        lift.element.classList.add("doors-closing");
        setTimeout(() => {
          lift.element.classList.remove("doors-closing");
          resolve();
        }, 2500);
      }, 2500);
    });
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
});
