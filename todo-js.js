"use strict";

document.addEventListener("DOMContentLoaded", function () {
  class Task {
    constructor(title, description, time, done = false) {
      this.title = title;
      this.description = description;
      this.time = time;
      this.done = done;
    }
  }

  const addNewPlus = document.querySelector(".plus_sve");
  const addNewWindow = document.querySelector(".add_new_shadow");
  const overlay = document.querySelector(".overlay");
  const exit = document.querySelector(".exit");
  const save = document.querySelector(".save_button");
  const tasks_ul = document.querySelector(".tasks_list");
  const displayRemoveTask = document.querySelector(".visibility");
  const removeTask = document.querySelector(".remove_task");
  const listItem = document.createElement("li");
  const maxIsReached = document.querySelector(".alert_shadow");
  const gotIt = document.querySelector(".gotit_button");
  const sortButton = document.querySelector(".sort_button");
  const bucket = document.querySelector(".bucket_color");

  class App {
    #tasks = [];
    #originalTasks = [];
    #sortOrder = "asc";

    constructor() {
      this._getLocalStorage();

      addNewPlus.addEventListener("click", this._addNewTask.bind(this));
      exit.addEventListener("click", this._exitNewTaskForm.bind(this));
      save.addEventListener("click", () => {
        let x = document.forms["form_input"]["title_form"].value;
        let y = document.forms["form_input"]["time_form"].value;
        if (x === "" || y === "") {
          alert("Fill out required fields!");
          return false;
        } else {
          this._saveNewTask();
          this._clearAndRemoveForm();
          this._renderTasks();
        }
      });

      sortButton.addEventListener("click", this._sortTasksByTime.bind(this));
      tasks_ul.addEventListener("click", this._checkDone.bind(this));
      listItem.addEventListener("click", this._removeListItem(this));

      this._clearLocalStorageEveryDay();
    }

    _addNewTask() {
      if (this.#tasks.length < 9) {
        addNewWindow.classList.remove("hidden");
        overlay.classList.remove("hidden");
      } else {
        overlay.classList.remove("hidden");
        maxIsReached.classList.remove("hidden");
      }
    }

    _exitNewTaskForm() {
      addNewWindow.classList.add("hidden");
      overlay.classList.add("hidden");
    }

    _saveNewTask() {
      const titleInput = document.querySelector(".title_form");
      const descriptionInput = document.querySelector(".description_form");
      const timeInput = document.querySelector(".time_form");

      const title = titleInput.value;
      const description = descriptionInput.value;
      const time = timeInput.value;

      const task = new Task(title, description, time);

      const listItem = document.createElement("li");

      listItem.innerHTML = `
            <div class="row_list">
              <div><p class="time_list visibility">${task.time}</p></div>
              <div class="checkbox_list ${task.done ? "check_img" : ""}"></div>
              <div><p class="title_list">${task.title}</p></div>
              <div><p class="description_list">•••</p></div>
              <div class="description_box_shadow hidden">
              <div class="description_box">
                <p>DESCRIPTION</p>
                <h5 class="description_text">${task.description}</h5>
              </div>
            </div>
            </div>
          `;

      tasks_ul.appendChild(listItem);

      this.#tasks.push(task);

      this._setLocalStorage();
      this.#originalTasks = [...this.#tasks];
    }

    _renderTasks() {
      tasks_ul.innerHTML = "";
      this.#tasks.forEach((task) => {
        const listItem = document.createElement("li");

        listItem.innerHTML = `
          <div class="row_list">
            <div><p class="remove_task visibility ">+</p></div>
            <div><p class="time_list">${task.time}</p></div>
            <div class="checkbox_list ${task.done ? "check_img" : ""}"></div>
            <div><p class="title_list">${task.title}</p></div>
            <div><p class="description_list">•••</p></div>
            <div class="description_box_shadow hidden">
      <div class="description_box">
        <p>DESCRIPTION</p>
        <h5 class="description_text">${task.description}</h5>
      </div>
    </div>
          </div>
        `;

        listItem.addEventListener("mouseenter", () => this._displayX(listItem));
        listItem.addEventListener("mouseleave", () => this._removeX(listItem));

        const descriptionDots = listItem.querySelector(".description_list");
        descriptionDots.addEventListener("mouseenter", () =>
          this._renderDescription(listItem)
        );
        descriptionDots.addEventListener("mouseleave", () =>
          this._hideDescription(listItem)
        );
        const removeTask = listItem.querySelector(".remove_task");
        removeTask.addEventListener("click", () =>
          this._removeListItem(listItem)
        );

        tasks_ul.appendChild(listItem);
      });
    }

    _renderDescription(listItem) {
      const descriptionBox = listItem.querySelector(".description_box_shadow");
      descriptionBox.classList.remove("hidden");
    }

    _hideDescription(listItem) {
      const descriptionBox = listItem.querySelector(".description_box_shadow");
      descriptionBox.classList.add("hidden");
    }

    _clearAndRemoveForm() {
      const titleInput = document.querySelector(".title_form");
      const descriptionInput = document.querySelector(".description_form");
      const timeInput = document.querySelector(".time_form");

      titleInput.value = "";
      descriptionInput.value = "";
      timeInput.value = "";

      addNewWindow.classList.add("hidden");
      overlay.classList.add("hidden");
    }

    _checkDone(e) {
      if (e.target.classList.contains("checkbox_list")) {
        const listItem = e.target.closest("li");
        const index = Array.from(listItem.parentNode.children).indexOf(
          listItem
        );

        this.#tasks[index].done = !this.#tasks[index].done;
        this._setLocalStorage();
        this._renderTasks();
      }
    }

    _displayX(listItem) {
      const removeTask = listItem.querySelector(".remove_task");
      removeTask.classList.remove("visibility");
    }

    _removeX(listItem) {
      const removeTask = listItem.querySelector(".remove_task");
      removeTask.classList.add("visibility");
    }

    _removeListItem(clickedElement) {
      const listItem = clickedElement.closest("li");
      const title = listItem.querySelector(".title_list").textContent;

      this.#tasks = this.#tasks.filter((task) => task.title !== title);
      this._setLocalStorage();

      listItem.remove();
    }

    _sortTasksByTime(e) {
      e.preventDefault();

      if (this.#sortOrder === "asc") {
        this.#tasks.sort((a, b) => {
          const timeA = new Date(`2000-01-01T${a.time}`);
          const timeB = new Date(`2000-01-01T${b.time}`);
          return timeA - timeB;
        });
      } else {
        this.#tasks = [...this.#originalTasks];
      }

      this.#sortOrder = this.#sortOrder === "asc" ? "desc" : "asc";
      this._renderTasks();
    }

    _setLocalStorage() {
      localStorage.setItem("tasks", JSON.stringify(this.#tasks));
    }

    _getLocalStorage() {
      const data = JSON.parse(localStorage.getItem("tasks"));
      if (Array.isArray(data)) {
        this.#tasks = data.map(
          (taskData) =>
            new Task(
              taskData.title,
              taskData.description,
              taskData.time,
              taskData.done
            )
        );
        this.#originalTasks = [...this.#tasks];
      }
      this._renderTasks();
    }

    _setMaxLengthOfArray() {
      if (this.#tasks.length == 9) {
        this.#tasks.slice(0, 9);
        alert("You reached max number of tasks!");
      }
    }
  }

  const m = moment();
  const date = document.querySelector(".date");
  date.textContent = m.format("LL");

  new App();
});

document.addEventListener("DOMContentLoaded", function () {
  const gotIt = document.querySelector(".gotit_button");
  const overlay = document.querySelector(".overlay");
  const maxIsReached = document.querySelector(".alert_shadow");
  const bucket = document.querySelector(".bucket_color");
  const green = document.querySelector(".green");
  const bubbleWindow = document.querySelector(".bubble");
  const setNewGoals = document.querySelector(".button_animation_shadow");
  const animation = document.querySelector(".animation");
  const overlayAnimation = document.querySelector(".overlay_animation");

  class AlertMe {
    constructor(overlay) {
      this.overlay = overlay;
      gotIt.addEventListener("click", this._exitAlert.bind(this));
      bucket.addEventListener("mouseover", this._displayBubble.bind(this));
      bucket.addEventListener("mouseout", this._removeBubble.bind(this));
      bucket.addEventListener("click", this._displayColorPalette.bind(this));
      green.addEventListener("click", this._changeTheme.bind(this));
      setNewGoals.addEventListener("click", this._setNewGoals.bind(this));

      document.addEventListener(
        "click",
        function (event) {
          const target = event.target;
          const colorPalette = document.querySelector(".color_palette");

          if (!bucket.contains(target) && !colorPalette.contains(target)) {
            colorPalette.classList.add("hidden");
          } else {
            colorPalette.classList.remove("hidden");
          }
        }.bind(this)
      );

      const savedTheme = localStorage.getItem("selectedTheme");
      if (savedTheme) {
        this._applyTheme(savedTheme);
      }
    }
    _setNewGoals() {
      overlayAnimation.classList.add("hidden");
      animation.classList.add("hidden");
    }
    _exitAlert() {
      overlay.classList.add("hidden");
      maxIsReached.classList.add("hidden");
    }

    _displayBubble() {
      const bubbleWindow = document.querySelector(".bubble");
      bubbleWindow.classList.remove("hidden");
    }

    _removeBubble() {
      const bubbleWindow = document.querySelector(".bubble");
      bubbleWindow.classList.add("hidden");
    }

    _displayColorPalette() {
      const colorPalette = document.querySelector(".color_palette");
      colorPalette.classList.remove("hidden");
    }

    _removeColorPalette(event) {
      const colorPalette = document.querySelector(".color_palette");
      colorPalette.classList.remove("hidden");
    }

    _changeTheme() {
      const colors = document.querySelectorAll(".theme");

      colors.forEach((color) => {
        color.addEventListener("click", function () {
          const root = document.documentElement;
          let themeColor;

          if (color.classList.contains("green")) {
            themeColor = "#8ded39";
          } else if (color.classList.contains("blue")) {
            themeColor = "#84a4e0";
          } else if (color.classList.contains("turquoise")) {
            themeColor = "#43f077";
          } else if (color.classList.contains("pink")) {
            themeColor = "#d880b2";
          } else if (color.classList.contains("purple")) {
            themeColor = "#dc96dc";
          } else if (color.classList.contains("yellow")) {
            themeColor = "#edea44";
          }

          root.style.setProperty("--turquoise", themeColor);
          localStorage.setItem("selectedTheme", themeColor);
        });
      });
    }

    _applyTheme(themeColor) {
      const root = document.documentElement;
      root.style.setProperty("--turquoise", themeColor);
      localStorage.setItem("selectedTheme", themeColor);
    }
  }

  const savedTheme = localStorage.getItem("selectedTheme");

  if (savedTheme) {
    const root = document.documentElement;
    root.style.setProperty("--turquoise", savedTheme);
  }

  const alertMeInstance = new AlertMe();
});
