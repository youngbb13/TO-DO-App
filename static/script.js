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

    // Це обробник події зміни чекбокса, який оновлює статус todo-задачі і на бекенді, і в інтерфейсі.
    checkbox.addEventListener("change", async () => { // Коли користувач клікає чекбокс (ставить/знімає галочку), виконується ця функція
        const wasChecked = checkbox.checked; // Запам’ятовуємо новий стан чекбокса


        try {
            // Відправка запиту на сервер
            const response = await fetch(`${API_BASE}/${todo.id}`, {
                method: "PUT", // оновлення існуючого todo
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: todo.title,                    // обов’язково, бо Pydantic вимагає title
                    description: todo.description || null,
                    done: wasChecked
                })
            });

            // Перевірка відповіді сервера
            if (!response.ok) {
                let errorMsg = `Помилка ${response.status}`;
                try { // Пробуємо витягнути detail з JSON
                    const errData = await response.json();
                    errorMsg += `: ${errData.detail || 'невідома помилка'}`;
                } catch {} // Якщо JSON не прийшов або зламався — просто ігноруємо:
                throw new Error(errorMsg);
            }

            // Якщо все ок — оновлюємо інтерфейс
            if (wasChecked) {
                span.classList.add("completed");
                if (descEl) descEl.classList.add("completed");
            } else {
                span.classList.remove("completed");
                if (descEl) descEl.classList.remove("completed");
            }

            todo.done = wasChecked; // Оновлюємо локальний стан

        } catch (err) {
            console.error("Помилка зміни статусу:", err);
            checkbox.checked = !wasChecked; // відкат
            alert("Не вдалося змінити статус\n" + err.message);
        }
    });

    // deleting
    deleteBtn.onclick = async () => {
        if (!confirm("Delete task?")) return; // Браузер показує стандартне віконце: OK → продовжуємо,  Cancel → return, і нічого не відбувається
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
            // switch to edit mode | Створення полів для редагування
            const titleInput = document.createElement("input");
            titleInput.type = "text";
            titleInput.value = todo.title;
            titleInput.className = "edit-input";

            // завжди показуємо поле опису при редагуванні, навіть якщо його не було
            const descInput = document.createElement("textarea");
            descInput.value = todo.description || "";
            descInput.placeholder = "Description (optional)";
            descInput.className = "edit-desc";

            // Заміна елементів у DOM
            li.replaceChild(titleInput, span); // <span> з назвою → замінюється на <input>
            if (descEl) {
                li.replaceChild(descInput, descEl); // якщо опис був → міняємо його на textarea
            } else {
                li.insertBefore(descInput, btns); // якщо не було → просто вставляємо перед кнопками
            }

            editBtn.textContent = "Save";
            titleInput.focus();

            // функція збереження (визначена перед прив’язкою)
            // Оголошується всередині, щоб мати доступ до: titleInput, descInput, todo, descEl
            const saveChanges = async () => {
                const newTitle = titleInput.value.trim(); // .trim() — прибирає пробіли
                const newDesc = descInput.value.trim() || null; // пустий опис → null (зручно для бекенду)

                if (!newTitle) {
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

                    if (!res.ok) {
                        let errorMsg = `Помилка ${res.status}`;
                        try {
                            const errData = await res.json();
                            errorMsg += `: ${errData.detail || 'невідома помилка'}`;
                        } catch {}
                        throw new Error(errorMsg);
                    }

                    // Якщо збереження успішне — оновлюємо UI
                    // Повертаємо <span> замість <input>
                    span.textContent = newTitle;
                    li.replaceChild(span, titleInput);

                    // Опис (3 сценарії)

                    // Опис є і був
                    if (newDesc) {
                        if (descEl) {
                            descEl.textContent = newDesc;
                            li.replaceChild(descEl, descInput);
                        } else {
                            // Опис є, але його не було
                            descEl = document.createElement("small");
                            descEl.className = "task-desc";
                            descEl.textContent = newDesc;
                            li.insertBefore(descEl, btns);
                        }
                    } else if (descEl) { // Опис видалили
                        descEl.remove();
                        descEl = null;
                    }

                    // Повернення в режим "Edit"
                    editBtn.textContent = "Edit";
                    todo.title = newTitle;
                    todo.description = newDesc;

                } catch (err) {
                    console.error("Помилка збереження:", err);
                    alert("Не вдалося зберегти зміни\n" + err.message);
                }
            };

            // Перепривʼязка кнопки, Кнопка тепер викликає іншу логіку
            editBtn.onclick = saveChanges;

        }
    };
}

// додавання нової задач
async function addTask() { // бере текст із поля вводу
    // Зчитування і перевірка назви
    const title = newTaskInput.value.trim();
    if (!title) return;

    try {
        const res = await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({title, description: ""}) //description поки порожній
        });

        // Перевірка відповіді
        if (!res.ok) throw new Error();

        const newTodo = await res.json(); // Отримання створеного todo
        renderTodo(newTodo); // Додавання в UI

        // Очищення і закриття форми
        newTaskInput.value = "";
        newTaskContainer.style.display = "none";
    } catch {
        alert("Failed to add task!");
    }
}