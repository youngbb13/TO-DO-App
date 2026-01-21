const listEl = document.getElementById("todo-list");
const addBtn = document.getElementById("add-btn");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");

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
