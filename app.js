// State Management
let tasks = [];
let currentFilter = 'all';
let searchPattern = '';
let editingTaskId = null;

// DOM Elements
const tasksList = document.getElementById('tasks-list');
const totalCountEl = document.getElementById('total-count');
const flaggedCountEl = document.getElementById('flagged-count');
const completionPercentageEl = document.getElementById('completion-percentage');
const progressCircle = document.getElementById('progress-circle');

const tabButtons = document.querySelectorAll('.tab-btn');
const searchInput = document.getElementById('search-input');

// Badges
const badgeAll = document.getElementById('badge-all');
const badgePending = document.getElementById('badge-pending');
const badgeFlagged = document.getElementById('badge-flagged');
const badgeCompleted = document.getElementById('badge-completed');

// Modal Elements
const taskModal = document.getElementById('task-modal');
const btnNewTaskTrigger = document.getElementById('btn-new-task-trigger');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');
const taskForm = document.getElementById('task-form');
const modalTitle = document.getElementById('modal-title');

const inputTitle = document.getElementById('task-title');
const inputDesc = document.getElementById('task-desc');
const inputPriority = document.getElementById('task-priority');
const inputFlagged = document.getElementById('task-flagged');

// Circular Progress Configuration
const radius = progressCircle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = circumference;

// Default Prototype Tasks to showcase features immediately
const defaultTasks = [
    {
        id: '1',
        title: 'Design Zenith Flow Dashboard Prototype',
        description: 'Complete high fidelity mockups & implementation plan for interactive task manager.',
        priority: 'high',
        completed: true,
        flagged: true,
        createdAt: Date.now() - 3600000 * 2
    },
    {
        id: '2',
        title: 'Draft User Feedback Protocol',
        description: 'Establish standard interview questions to present for the interactive review stage.',
        priority: 'medium',
        completed: false,
        flagged: false,
        createdAt: Date.now() - 3600000
    },
    {
        id: '3',
        title: 'Implement Dark Glassmorphism Styles',
        description: 'Define clean modern color palettes using CSS custom properties and backdrop-filter.',
        priority: 'low',
        completed: false,
        flagged: true,
        createdAt: Date.now()
    }
];

// Initialize Application
function init() {
    const stored = localStorage.getItem('zenith_tasks');
    if (stored) {
        tasks = JSON.parse(stored);
    } else {
        tasks = defaultTasks;
        saveToLocalStorage();
    }
    
    setupEventListeners();
    render();
}

// Event Listeners setup
function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.tab;
            render();
        });
    });

    // Search event
    searchInput.addEventListener('input', (e) => {
        searchPattern = e.target.value.toLowerCase();
        render();
    });

    // Modal Control events
    btnNewTaskTrigger.addEventListener('click', () => openModal());
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);
    
    // Save/Submit Form
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTask();
    });

    // Close modal on click outside content
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeModal();
        }
    });
}

// Save & Sync Utility
function saveToLocalStorage() {
    localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
}

// Progress Ring update
function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

// Open Modal (for Create or Edit)
function openModal(taskId = null) {
    editingTaskId = taskId;
    if (taskId) {
        modalTitle.textContent = 'Edit Task Details';
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            inputTitle.value = task.title;
            inputDesc.value = task.description;
            inputPriority.value = task.priority;
            inputFlagged.checked = task.flagged;
        }
    } else {
        modalTitle.textContent = 'Create New Task';
        taskForm.reset();
    }
    taskModal.classList.add('active');
    inputTitle.focus();
}

// Close Modal
function closeModal() {
    taskModal.classList.remove('active');
    editingTaskId = null;
}

// Add/Update Task action
function saveTask() {
    const title = inputTitle.value.trim();
    const description = inputDesc.value.trim();
    const priority = inputPriority.value;
    const flagged = inputFlagged.checked;

    if (editingTaskId) {
        // Edit Mode
        tasks = tasks.map(task => {
            if (task.id === editingTaskId) {
                return { ...task, title, description, priority, flagged };
            }
            return task;
        });
    } else {
        // Create Mode
        const newTask = {
            id: Date.now().toString(),
            title,
            description,
            priority,
            completed: false,
            flagged,
            createdAt: Date.now()
        };
        tasks.unshift(newTask);
    }

    saveToLocalStorage();
    closeModal();
    render();
}

// Toggle Completed State
function toggleComplete(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveToLocalStorage();
    render();
}

// Toggle Flagged State
function toggleFlag(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, flagged: !task.flagged };
        }
        return task;
    });
    saveToLocalStorage();
    render();
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveToLocalStorage();
    render();
}

// Render Dashboard UI
function render() {
    // Filter tasks logic
    const filteredTasks = tasks.filter(task => {
        // Text search match
        const matchesSearch = task.title.toLowerCase().includes(searchPattern) || 
                              task.description.toLowerCase().includes(searchPattern);
        
        if (!matchesSearch) return false;

        // Category filter match
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        if (currentFilter === 'flagged') return task.flagged;
        
        return true;
    });

    // Update statistics panel & badges
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const flagged = tasks.filter(t => t.flagged).length;

    totalCountEl.textContent = total;
    flaggedCountEl.textContent = flagged;
    
    // Percentage Calculator
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    completionPercentageEl.textContent = `${percentage}%`;
    setProgress(percentage);

    // Badges update
    badgeAll.textContent = total;
    badgePending.textContent = pending;
    badgeFlagged.textContent = flagged;
    badgeCompleted.textContent = completed;

    // Render list
    tasksList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fa-solid fa-folder-open"></i></div>
                <h3>No Tasks Found</h3>
                <p>Add a new task or adjust your search filter to display items here.</p>
            </div>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        card.setAttribute('data-id', task.id);

        card.innerHTML = `
            <label class="check-wrapper">
                <input type="checkbox" class="check-input" ${task.completed ? 'checked' : ''}>
                <span class="checkmark"></span>
            </label>
            <div class="task-details">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <h4 class="task-title">${escapeHTML(task.title)}</h4>
                    <span class="priority-tag ${task.priority}">${task.priority}</span>
                </div>
                ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}
            </div>
            <div class="task-actions">
                <button class="action-btn btn-flag ${task.flagged ? 'flagged' : ''}" title="Flag task">
                    <i class="fa-${task.flagged ? 'solid' : 'regular'} fa-bookmark"></i>
                </button>
                <button class="action-btn btn-edit" title="Edit task">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="action-btn btn-delete" title="Delete task">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        `;

        // Event hooks for interactive elements inside the card
        const checkInput = card.querySelector('.check-input');
        checkInput.addEventListener('change', () => toggleComplete(task.id));

        const btnFlag = card.querySelector('.btn-flag');
        btnFlag.addEventListener('click', () => toggleFlag(task.id));

        const btnEdit = card.querySelector('.btn-edit');
        btnEdit.addEventListener('click', () => openModal(task.id));

        const btnDelete = card.querySelector('.btn-delete');
        btnDelete.addEventListener('click', () => deleteTask(task.id));

        tasksList.appendChild(card);
    });
}

// Helper to escape HTML tags
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Start app
window.addEventListener('DOMContentLoaded', init);
