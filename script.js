/** @format */

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-simulation");
  const floorsContainer = document.getElementById("floors-container");
  const liftsContainer = document.getElementById("lifts-container");
  let floors = [];
  let lifts = [];
  let floorHeight = 100; // Height of each floor in pixels

  startButton.addEventListener("click", startSimulation);

  function startSimulation() {
    const numFloors = parseInt(document.getElementById("floors").value);
    const numLifts = parseInt(document.getElementById("lifts").value);

    if (numFloors < 2 || numLifts < 1 || numLifts > 10) {
      alert("Please enter valid numbers for floors (min 2) and lifts (1-10).");
      return;
    }

    floorsContainer.innerHTML = "";
    liftsContainer.innerHTML = "";
    floors = [];
    lifts = [];

    createFloors(numFloors);
    createLifts(numLifts, numFloors);
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

  function createLifts(numLifts, numFloors) {
    for (let i = 0; i < numLifts; i++) {
      const lift = document.createElement("div");
      lift.className = "lift";
      lift.innerHTML = `
        <div class="lift-display">
          <span class="lift-floor">1</span>
          <span class="lift-direction"></span>
        </div>
        <div class="lift-doors">
          <div class="lift-door lift-door-left"></div>
          <div class="lift-door lift-door-right"></div>
        </div>
      `;
      lift.style.left = `${i * 80}px`;
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
    const availableLift = lifts.find((lift) => !lift.isMoving);
    if (availableLift) {
      if (!availableLift.targetFloors.includes(targetFloor)) {
        availableLift.targetFloors.push(targetFloor);
      }
      if (!availableLift.isMoving) {
        moveLift(availableLift, availableLift.targetFloors.shift());
      }
    } else {
      const nearestLift = findNearestLift(targetFloor, direction);
      if (!nearestLift.targetFloors.includes(targetFloor)) {
        nearestLift.targetFloors.push(targetFloor);
      }
    }
  }

  function findNearestLift(targetFloor, direction) {
    return lifts.reduce((nearest, current) => {
      const currentDistance = Math.abs(current.currentFloor - targetFloor);
      const nearestDistance = Math.abs(nearest.currentFloor - targetFloor);
      if (currentDistance === nearestDistance) {
        return current.targetFloors.length < nearest.targetFloors.length
          ? current
          : nearest;
      }
      return currentDistance < nearestDistance ? current : nearest;
    });
  }

  async function moveLift(lift, targetFloor) {
    lift.isMoving = true;
    const floorsToMove = Math.abs(targetFloor - lift.currentFloor);
    const direction = targetFloor > lift.currentFloor ? 1 : -1;

    const displayFloor = lift.element.querySelector(".lift-floor");
    const displayDirection = lift.element.querySelector(".lift-direction");
    displayDirection.textContent = direction > 0 ? "▲" : "▼";

    for (let i = 0; i < floorsToMove; i++) {
      lift.currentFloor += direction;
      displayFloor.textContent = lift.currentFloor;
      const translateY = (lift.currentFloor - 1) * floorHeight;
      lift.element.style.transform = `translateY(-${translateY}px)`;
      await wait(2000); // 2 seconds per floor
    }

    displayDirection.textContent = "";
    await openCloseDoors(lift);

    lift.isMoving = false;

    if (lift.targetFloors.length > 0) {
      const nextFloor = lift.targetFloors.shift();
      moveLift(lift, nextFloor);
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
