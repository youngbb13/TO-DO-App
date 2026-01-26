const addBtn = document.getElementById("add-btn");
const newTaskContainer = document.getElementById('new-task-container');
const saveBtn = document.getElementById('save-btn');
const newTaskInput = document.getElementById('new-task-input');
const taskList = document.getElementById('task-list');

//
const API_BASE = "/api/todos";

window.addEventListener("load", loadTasks);

// Кнопка нажимаєтсья і можна вписати завдання
addBtn.addEventListener("click", () => {
    newTaskContainer.style.display = 'flex';
    newTaskInput.focus();
});

//
saveBtn.addEventListener("click", addTask);

//
async function loadTasks() {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("Failed to load tasks!")
        const todos = await res.json();
        taskList.innerHTML = "";
        todos.forEach(renderTodo);
    } catch (err) {
        console.error(err)
        alert("Error loading list!");
    }
}

