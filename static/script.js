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
        const res = await fetch(API_BASE); //робить HTTP-запит до сервера за адресою API_BASE
        if (!res.ok) throw new Error("Failed to load tasks!")
        const todos = await res.json(); //перетворює відповідь від сервера у JavaScript-об’єкт або масив.
        taskList.innerHTML = "";
        todos.forEach(renderTodo); //forEach перебирає всі елементи масиву todos
    } catch (err) {
        console.error(err)
        alert("Error loading list!");
    }
}

// функція приймає одне завдання (todo)  і створює HTML-елементи
function renderTodo(todo) {
    const li = document.createElement("li"); //Створюється HTML-елемент `<li>` — один пункт списку.
    li.dataset.id = todo.id; // додає **data-id** атрибут: <li data-id="1"></li>

    // checkbox "completed"
    const checkbox = document.createElement("input"); // Створюється <input type="checkbox">
    checkbox.type = "checkbox";
    checkbox.checked = todo.done; // якщо todo.done === true → чекбокс буде відмічений
    checkbox.className = "task-checkbox"; // className — для стилів(css) або подій

    // task text
    const span = document.createElement("span"); // Створюється <span> для тексту завдання
    span.className = "task-text";
    span.textContent = todo.title; // textContent — безпечне вставлення тексту (без HTML)
    if (todo.done) span.classList.add("completed"); // Якщо завдання виконане (done === true), додається клас completed

    // description (if exist)
    let descEl = null; // Змінна для опису, null — якщо опису нема
    if (todo.description?.trim()) { // Optional chaining ?. — дозволяє безпечно звертатися до вкладених властивостей об’єкта, не отримуючи помилку, якщо щось по дорозі null або undefined.
        descEl = document.createElement("small"); // Створюється <small> — зазвичай для меншого тексту
        descEl.className = "task-desc";
        descEl.textContent = todo.description; // вставляє текст опису завдання (todo.description) всередину HTML-елемента descEl як звичайний текст.
        if (todo.done) descEl.classList.add("completed"); // Якщо завдання виконане — опис теж стає «completed»
    }

    // buttons | Цей код створює кнопки редагування й видалення, збирає всі частини завдання в <li> і додає його до списку на сторінці.
    const btns = document.createElement("div"); // Створюється контейнер <div> для кнопок Edit і Delete.
    btns.className = "task-buttons";

    // Створюється кнопка Edit з текстом і CSS-класом.
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";

    // Створюється кнопка Delete з текстом і CSS-класом.
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";

    btns.append(editBtn, deleteBtn); // Обидві кнопки додаються всередину контейнера btns.

    // element assembly <li>
    li.append(checkbox, span); // У <li> додаються чекбокс і текст завдання.
    if (descEl) li.append(descEl); // Опис додається тільки якщо він існує.
    li.append(btns); // Додається блок з кнопками.
    taskList.appendChild(li); // Готове завдання додається у список на сторінці → стає видимим користувачу.

    // -----------ОБРОБНИКИ------------

    // switching "done"
    // Цей код відстежує зміну чекбокса, відправляє новий статус завдання на сервер, оновлює вигляд завдання на сторінці, а у разі помилки повертає все назад і показує повідомлення.
    checkbox.addEventListener("change", async () => { // Слухаємо подію change — вона спрацьовує, коли користувач ставить або знімає галочку
        try {
            // Відправляємо PUT-запит на сервер
            const res = await fetch(`${API_BASE}/${todo.id}`, { // ${API_BASE}/${todo.id} — оновлюємо конкретне завдання
               method: "PUT",
               headers: { "Content-Type": "application/json"},
               body: JSON.stringify({ done: checkbox.checked}) // JSON.stringify перетворює об’єкт у JSON
            });
            if (!res.ok) throw new Error();
            if (checkbox.checked) {
                span.classList.add("completed");
                if (descEl) descEl.classList.add("completed"); // Якщо завдання виконане, додаємо клас completed до тексту і опису
            } else {
                span.classList.remove("completed");
                if (descEl) descEl.classList.remove("completed"); // Якщо ні, прибираємо цей клас
            }
        } catch {
            checkbox.checked = !checkbox.checked; // відкат, Якщо щось пішло не так, повертаємо чекбокс у попередній стан
            alert("Failed to change the status!"); // показуємо повідомлення користувачу
        }
    });

    // deleting
    deleteBtn.onclick = async () => {
        if (!confirm("Delete task?")) return;
        try {
            const res = await fetch(`${API_BASE}/${todo.id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                li.remove();
            } else {
                alert("Failed to delete!");
            }
        } catch {
            alert("Network Error!");
        }
    };

    // editing (title + description)
    editBtn.onclick = () => {
        if (editBtn.textContent === "Edit") {
            // switch to edit mode
            const titleInput = document.createElement("input");
            titleInput.type = "text";
            titleInput.value = todo.title;
            titleInput.className = "edit-input";

            //
            let descInput = null;
            if (todo.description || true) { //показуємо поле навіть якщо опису не було
                descInput = document.createElement("textarea");
                descInput.value = todo.description || "";
                descInput.placeholder = "Description (optional)";
                descInput.className = "edit-desc";
            }

            //
            li.replaceChild(titleInput, span);
            if(descEl) {
                li.replaceChild(descInput, descEl);
            } else if (descInput) {
                li.insertBefore(descInput, btns);
            }

            editbtn.textContent = "Save";
            titleInput.focus();

            //
            const saveChanges = async () => {
                const newTitle = titleInput.value.trim();
                const newDesc = descInput ? descInput.value.trim() : undefined;

                if(!newTitle) {
                    alert("Title must be written!");
                    return;
                }

                try {
                    const res = await fetch(`${API_BASE}/${todo.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: newTitle,
                            description: newDesc,
                            done: todo.done //зберігаємо поточний стан
                        })
                    });

                    //
                    if (res.ok) {
                        span.textContent= newTitle;
                        li.replaceChild(span, titleInput);

                        if(descInput) {
                            if (newDesc) {
                                if (descEl) {
                                    descEl.textContent = newDesc;
                                    li.replaceChild(descEl, descInput);
                                } else {
                                    descEl = document.createElement("small");
                                    descEl.className = "task-desc";
                                    descEl.textContent = newDesc;
                                    li.insertBefore(descEl, btns);
                                }
                            } else if (descEl) {
                                descEl.remove();
                                descEl = null;
                            }
                        }

                        //
                        editBtn.textContent = "Edit";
                        todo.title = newTitle;
                        todo.description = newDesc || null;
                    } else {
                        alert("Failed to save changes!");
                    }
                } catch {
                    alert("Network Error!");
                }
            };
        }
    };
}

//
async function addTask() {
    const title = newTaskInput.value.trim();
    if (!title) return;

    try {
        const res = await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({title, description: ""}) //description поки порожній
        });

        //
        if (!res.ok) throw new Error();

        const newTodo = await res.json();
        renderTodo(newTodo);

        newTaskInput.value = "";
        newTaskContainer.style.display = "none";
    } catch {
        alert("Failed to add task!");
    }
}