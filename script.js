// Load tasks from localStorage when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize delete bar elements
    deleteBar = document.getElementById('deleteBar');
    selectedCount = document.getElementById('selectedCount');
    deleteSelected = document.getElementById('deleteSelected');
    
    // Add click handler for delete selected button
    deleteSelected.addEventListener('click', deleteSelectedTasks);
    
    // Add toggle all handler
    document.getElementById('toggleAll').addEventListener('change', toggleAllItems);
    
    // Load tasks and add predefined tasks button
    loadTasks();
    addPredefinedTasksButton();
});

// Predefined daily tasks
const predefinedTasks = [
    "Sholat 5 waktu",
    "Merapikan tempat tidur",
    "Mencuci piring",
    "Menyapu rumah",
    "Mengepel lantai",
    "Mencuci baju",
    "Menjemur pakaian",
    "Menyiram tanaman",
    "Membersihkan kamar mandi",
    "Membuang sampah"
];

// Track selected items
let selectedForDeletion = new Set();

// Initialize delete bar elements
let deleteBar;
let selectedCount;
let deleteSelected;

function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();
    
    if (taskText !== '') {
        const task = {
            id: Date.now() + Math.random(),
            text: taskText,
            completed: false,
            date: new Date().toLocaleDateString()
        };
        
        const tasks = getTasks();
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTask(task);
        input.value = '';
    }
}

function displayTask(task) {
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.setAttribute('data-id', task.id);
    
    li.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
        <span class="task-text">${task.text}</span>
        <span class="task-date">${task.date}</span>
        <input type="checkbox" class="delete-checkbox" onchange="toggleDeleteSelection(${task.id}, this)">
    `;
    
    taskList.appendChild(li);
}

function toggleTask(taskId) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        const taskElement = document.querySelector(`li[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.toggle('completed');
        }

        // Check if all tasks are completed
        checkAllTasksCompleted();
    }
}

function toggleDeleteSelection(taskId, checkbox) {
    const taskElement = document.querySelector(`li[data-id="${taskId}"]`);
    
    if (checkbox.checked) {
        selectedForDeletion.add(taskId);
        taskElement.classList.add('selected-for-deletion');
    } else {
        selectedForDeletion.delete(taskId);
        taskElement.classList.remove('selected-for-deletion');
    }
    
    updateDeleteBar();
}

function updateDeleteBar() {
    const count = selectedForDeletion.size;
    const toggleAllCheckbox = document.getElementById('toggleAll');
    const deleteCheckboxes = document.querySelectorAll('.delete-checkbox');
    
    if (count > 0) {
        selectedCount.textContent = `${count} item dipilih`;
        deleteBar.classList.remove('hidden');
        
        // Update toggle all checkbox state
        toggleAllCheckbox.checked = count === deleteCheckboxes.length;
    } else {
        deleteBar.classList.add('hidden');
        toggleAllCheckbox.checked = false;
    }
}

function toggleAllItems(e) {
    const isChecked = e.target.checked;
    const deleteCheckboxes = document.querySelectorAll('.delete-checkbox');
    
    deleteCheckboxes.forEach(checkbox => {
        if (checkbox.checked !== isChecked) {
            checkbox.checked = isChecked;
            const taskId = parseFloat(checkbox.closest('li').getAttribute('data-id'));
            toggleDeleteSelection(taskId, checkbox);
        }
    });
}

function deleteSelectedTasks() {
    const tasks = getTasks().filter(task => !selectedForDeletion.has(task.id));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    selectedForDeletion.forEach(taskId => {
        const taskElement = document.querySelector(`li[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.remove();
        }
    });
    
    selectedForDeletion.clear();
    updateDeleteBar();
}

function deleteTask(taskId) {
    const tasks = getTasks().filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    const taskElement = document.querySelector(`li[data-id="${taskId}"]`);
    if (taskElement) {
        taskElement.remove();
    }
}

function getTasks() {
    return JSON.parse(localStorage.getItem('tasks') || '[]');
}

function loadTasks() {
    const tasks = getTasks();
    tasks.forEach(task => displayTask(task));
}

// Add button to load predefined tasks
function addPredefinedTasksButton() {
    const todoInput = document.querySelector('.todo-input');
    const predefinedButton = document.createElement('button');
    predefinedButton.textContent = 'Tambah Tugas Harian';
    predefinedButton.onclick = loadPredefinedTasks;
    predefinedButton.style.backgroundColor = '#2196F3';
    todoInput.appendChild(predefinedButton);
}

// Load predefined tasks
function loadPredefinedTasks() {
    predefinedTasks.forEach(taskText => {
        const tasks = getTasks();
        const taskExists = tasks.some(task => 
            task.text.toLowerCase() === taskText.toLowerCase() && 
            task.date === new Date().toLocaleDateString()
        );
        
        if (!taskExists) {
            const task = {
                id: Date.now() + Math.random(),
                text: taskText,
                completed: false,
                date: new Date().toLocaleDateString()
            };
            
            const tasks = getTasks();
            tasks.push(task);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            displayTask(task);
        }
    });
}

// Add task when Enter key is pressed
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Function to check if all tasks are completed
function checkAllTasksCompleted() {
    const tasks = getTasks();
    if (tasks.length === 0) return;

    const allCompleted = tasks.every(task => task.completed);
    if (allCompleted) {
        showCelebration();
    }
}

// Function to show celebration
function showCelebration() {
    const celebration = document.getElementById('celebration');
    celebration.classList.add('show');
    
    // Start confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            clearInterval(interval);
            setTimeout(() => {
                celebration.classList.remove('show');
            }, 1000);
            return;
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
}
