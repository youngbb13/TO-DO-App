const listEl = document.getElementById("todo-list");
const addBtn = document.getElementById("add-btn");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");




const newTaskContainer = document.getElementById('new-task-container');
const saveBtn = document.getElementById('save-btn');
const newTaskInput = document.getElementById('new-task-input');
const taskList = document.getElementById('task-list');


addBtn.addEventListener('click', () => {
    newTaskContainer.style.display = 'flex';
    newTaskInput.focus(); // автоматично ставимо курсор в поле
});

saveBtn.addEventListener('click', () => {
    const taskText = newTaskInput.value.trim();
    if(taskText !== '') {
        const li = document.createElement('li');
        li.textContent = taskText;
        taskList.appendChild(li);
        newTaskInput.value = ''; // очищаємо поле після збереження
    }
});




async function fetchTodos() {
    const res = await fetch("/api/todos");
    const todos = await res.json();
    listEl.innerHTML = "";
    todos.forEach(todo => {
        const li = document.createElement("li");
        li.className = "todo-item" + (todo.done ? " done" : "");
        li.innerHTML = `
            <span>${todo.title} ${todo.description ? "- " + todo.description : ""}</span>
            <span>
                <button onclick="toggleDone(${todo.id}, ${todo.done})">✔</button>
                <button onclick="deleteTodo(${todo.id})">🗑</button>
            </span>
        `;
        listEl.appendChild(li);
    });
}

async function addTodo() {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    if (!title) return alert("Введіть назву!");
    await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description })
    });
    titleInput.value = "";
    descInput.value = "";
    fetchTodos();
}

async function toggleDone(id, done) {
    const res = await fetch(`/api/todos/${id}`);
    const todo = await res.json();
    await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: todo.title, description: todo.description, done: !done })
    });
    fetchTodos();
}

async function deleteTodo(id) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    fetchTodos();
}

addBtn.addEventListener("click", addTodo);
fetchTodos();
