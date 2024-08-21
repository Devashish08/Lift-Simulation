/** @format */

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-simulation");
  const floorsContainer = document.getElementById("floors-container");
  const liftsContainer = document.getElementById("lifts-container");
  let floors = [];
  let lifts = [];
  let floorHeight = 80; // Height of each floor in pixels
  let pendingRequests = [];

  startButton.addEventListener("click", startSimulation);

  function startSimulation() {
    const numFloors = parseInt(document.getElementById("floors").value);
    const numLifts = parseInt(document.getElementById("lifts").value);

    if (numFloors < 2 || numLifts < 1 || numFloors > 100 || numLifts > 100) {
      alert(
        "Please enter valid numbers for floors (2 - 100) and lifts (1 - 100)"
      );
      return;
    }

    floorsContainer.innerHTML = "";
    liftsContainer.innerHTML = "";
    floors = [];
    lifts = [];
    pendingRequests = [];

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
          <div class="floor-number">${i}</div>
        </div>
      `;
      floorsContainer.appendChild(floor);
      floors.push(floor);
    }
    addFloorButtonListeners();
  }

  function createLifts(numLifts) {
    document.documentElement.style.setProperty("--num-lifts", numLifts);
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
        destinationFloors: [], // Track all floors the lift is heading towards
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
    // Check if this request is already in the pendingRequests
    if (
      pendingRequests.some(
        (req) => req.floor === targetFloor && req.direction === direction
      )
    ) {
      return; // If there's already a pending request for this floor and direction, do nothing
    }

    // Check if any lift is already moving towards the target floor
    const liftHeadingToFloor = lifts.some((lift) =>
      lift.destinationFloors.includes(targetFloor)
    );
    if (liftHeadingToFloor) {
      return; // If a lift is already heading to the target floor, do nothing
    }

    // Check for idle lifts on the same floor
    const idleLiftsOnSameFloor = lifts.filter(
      (lift) => lift.currentFloor === targetFloor && !lift.isMoving
    );
    if (idleLiftsOnSameFloor.length > 0) {
      const nearestIdleLift = idleLiftsOnSameFloor[0];
      nearestIdleLift.targetFloors.push(targetFloor);
      nearestIdleLift.destinationFloors.push(targetFloor);
      moveLift(nearestIdleLift);
      return;
    }

    // Check for other idle lifts
    const idleLifts = lifts.filter((lift) => !lift.isMoving);
    if (idleLifts.length > 0) {
      const nearestIdleLift = idleLifts.reduce((prev, curr) =>
        Math.abs(curr.currentFloor - targetFloor) <
        Math.abs(prev.currentFloor - targetFloor)
          ? curr
          : prev
      );
      nearestIdleLift.targetFloors.push(targetFloor);
      nearestIdleLift.destinationFloors.push(targetFloor);
      moveLift(nearestIdleLift);
      return;
    }

    // If no idle lifts are available, add the request to the pending queue
    pendingRequests.push({ floor: targetFloor, direction: direction });
  }

  async function moveLift(lift) {
    lift.isMoving = true;
    const targetFloor = lift.targetFloors.shift();
    const translateY = (targetFloor - 1) * floorHeight;
    lift.element.style.transform = `translateY(-${translateY}px)`;
    await wait(2000); // Simulate movement time

    await openCloseDoors(lift);

    lift.currentFloor = targetFloor; // Update the lift's current floor
    lift.isMoving = false;
    lift.destinationFloors = lift.destinationFloors.filter(
      (floor) => floor !== targetFloor
    ); // Remove the reached floor from destinationFloors

    // Check for pending requests after completing this move
    checkPendingRequests();

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

  function checkPendingRequests() {
    if (pendingRequests.length > 0) {
      const nextRequest = pendingRequests.shift();
      const availableLifts = lifts.filter((lift) => !lift.isMoving);

      if (availableLifts.length > 0) {
        const nearestLift = availableLifts.reduce((prev, curr) =>
          Math.abs(curr.currentFloor - nextRequest.floor) <
          Math.abs(prev.currentFloor - nextRequest.floor)
            ? curr
            : prev
        );
        nearestLift.targetFloors.push(nextRequest.floor);
        nearestLift.destinationFloors.push(nextRequest.floor);
        moveLift(nearestLift);
      } else {
        // If no lifts are available, put the request back in the queue
        pendingRequests.unshift(nextRequest);
      }
    }
  }
});
