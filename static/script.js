const addBtn = document.getElementById("add-btn");
const newTaskContainer = document.getElementById('new-task-container');
const saveBtn = document.getElementById('save-btn');
const newTaskInput = document.getElementById('new-task-input');
const taskList = document.getElementById('task-list');
const taskEdit = document.getElementById('task-edit')
const taskDelete = document.getElementById('task-delete')

// Кнопка нажимаєтсья і можна вписати завдання
addBtn.addEventListener('click', () => {
    newTaskContainer.style.display = 'flex';
});

// Відповідає за збереження завдання
saveBtn.addEventListener('click', () => {
    const taskText = newTaskInput.value.trim();
    if(taskText !== '') {
        const li = document.createElement('li');
        li.textContent = taskText;
        taskList.appendChild(li);
        newTaskInput.value = ''; // очищаємо поле після збереження
    }
});