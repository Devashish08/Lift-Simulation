class LiftSystem {
  constructor(totalFloors, totalLifts) {
    this.totalFloors = totalFloors;
    this.totalLifts = totalLifts;

    this.lifts = [];
    for (let i = 1; i <= totalLifts; i++) {
      this.lifts.push(new Lift(i));
    }
    this.init();
  }

  init() {
    const buttons = document.querySelectorAll(".floor-lift-control-button");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const floor = parseInt(button.dataset.floor);
        const direction = button.dataset.direction;
        this.requestLift(floor, button);
      });
    });
  }

  requestLift(floor, button) {
    const lift = this.getNearestLift(floor);
    lift.addRequest(floor, button);
  }

  getNearestLift(floor) {
    let nearestLift = null;
    let minTime = Infinity;
    for (const lift of this.lifts) {
      const time = lift.getTimeToReach(floor);
      if (time < minTime) {
        nearestLift = lift;
        minTime = time;
      }
    }
    return nearestLift;
  }
}

class Lift {
  floorHeight = 140;
  currentFloor = 0;
  targetFloor = 0;
  queue = [];
  floorScreens = [];
  isMoving = false;
  LiftMoveTime = 2;
  LiftDoorMoveTime = 2.5;

  constructor(id) {
    this.id = id;
    this.element = document.getElementById(`lift-${id}`);
    this.screen = this.element.getElementsByClassName(
      "lift-door-screen-text"
    )[0];
    this.screen.innerHTML = this.currentFloor;
    this.screenUp = this.element.getElementsByClassName(
      "lift-door-screen-up"
    )[0];
    this.screenDown = this.element.getElementsByClassName(
      "lift-door-screen-down"
    )[0];
  }

  addRequest(floor, button) {
    button.style.backgroundColor = "green";
    button.disabled = true;
    this.queue.push({ floor, button });
    this.floorScreens.push(
      button.parentElement.getElementsByClassName(
        "floor-lift-control-screen"
      )[0]
    );
    this.updateScreenStatus();
    this.processQueue();
  }

  processQueue() {
    if (this.isMoving || this.queue.length === 0) return;

    const request = this.queue[0];
    this.moveToFloor(request.floor, request.button);
  }

  async moveToFloor(targetFloor, button) {
    this.isMoving = true;
    this.targetFloor = targetFloor;

    while (this.currentFloor !== this.targetFloor) {
      const nextFloor =
        this.currentFloor < this.targetFloor
          ? this.currentFloor + 1
          : this.currentFloor - 1;
      this.updatePosition(nextFloor);
      this.updateScreenStatus();
      await new Promise((r) => setTimeout(r, this.LiftMoveTime * 1000));
      this.currentFloor = nextFloor;
    }

    this.updateScreenStatus();

    this.openDoors();

    setTimeout(() => {
      this.closeDoors();

      setTimeout(() => {
        button.style.backgroundColor = "";
        button.disabled = false;
        this.queue.shift();
        this.isMoving = false;
        this.floorScreens[0].innerHTML = "";
        this.floorScreens.shift();
        this.processQueue();
      }, this.LiftDoorMoveTime * 1000);
    }, this.LiftDoorMoveTime * 1000);
  }

  updatePosition(nextFloor) {
    this.element.style.transform = `translateY(${
      -nextFloor * this.floorHeight
    }px)`;
  }

  updateScreenStatus() {
    let direction = "";
    for (const request of this.queue) {
      if (request.floor === this.currentFloor) {
        continue;
      }
      direction = request.floor > this.currentFloor ? "▲" : "▼";
      break;
    }
    this.screen.innerHTML = this.targetFloor;
    this.screenUp.innerHTML = direction === "▲" ? "▲" : "";
    this.screenDown.innerHTML = direction === "▼" ? "▼" : "";
    for (const floorScreen of this.floorScreens) {
      floorScreen.innerHTML = this.currentFloor + " " + direction;
    }
  }

  openDoors() {
    this.element.classList.add("open");
  }

  closeDoors() {
    this.element.classList.remove("open");
  }

  getTimeToReach(floor) {
    let time = 0;
    let currentLiftFloor = this.currentFloor;
    for (const request of this.queue) {
      time += Math.abs(currentLiftFloor - request.floor) * this.LiftMoveTime;
      currentLiftFloor = request.floor;
      time += 2 * this.LiftDoorMoveTime;
    }
    time += Math.abs(currentLiftFloor - floor) * this.LiftMoveTime;
    return time;
  }
}

// Expose to global scope
window.LiftSystem = LiftSystem;
