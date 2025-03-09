/**
 * Optimized To-Do List App
 * A clean, streamlined implementation with working functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        // Input elements
        taskInput: document.getElementById('taskInput'),
        alarmTime: document.getElementById('alarmTime'),
        alarmSound: document.getElementById('alarmSound'),
        addBtn: document.getElementById('addBtn'),
        taskList: document.getElementById('taskList'),
        
        // Theme toggle
        themeToggle: document.getElementById('themeToggle'),
        
        // Date picker elements
        datePickerModal: document.getElementById('datePickerModal'),
        datePicker: document.getElementById('datePicker'),
        timePicker: document.getElementById('timePicker'),
        confirmDateBtn: document.getElementById('confirmDateBtn'),
        cancelDateBtn: document.getElementById('cancelDateBtn'),
        selectDateBtn: document.getElementById('selectDateBtn'),
        clearDateBtn: document.getElementById('clearDateBtn'),
        
        // Filter buttons
        filterBtns: document.querySelectorAll('.filter-btn'),
        
        // Notification elements
        notification: document.getElementById('notification'),
        notificationMessage: document.getElementById('notification-message'),
        notificationClose: document.getElementById('notification-close'),
        snoozeBtn: document.getElementById('snooze-btn'),
        snoozeTime: document.getElementById('snoozeTime'),
        
        // Sound test button
        testSoundBtn: document.getElementById('testSoundBtn')
    };
    
    // Audio elements
    const audioElements = {};
    ['sound1', 'sound2', 'sound3', 'sound4', 'sound5'].forEach(id => {
        const audio = document.getElementById(id);
        if (audio) audioElements[id] = audio;
    });
    
    // Variables
    let tasks = [];
    let currentFilter = 'all';
    let currentAlarmTask = null;
    
    // Initialize
    initialize();
    
    /**
     * Initialize the application
     */
    function initialize() {
        // Load tasks from localStorage
        loadTasks();
        
        // Set up event listeners
        setupEventListeners();
        
        // Render initial tasks
        renderTasks();
        
        // Set up date picker default values
        setupDatePicker();
        
        // Apply theme from localStorage
        applyTheme();
    }
    
    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Add task button
        elements.addBtn.addEventListener('click', addTask);
        
        // Add task on Enter key
        elements.taskInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') addTask();
        });
        
        // Theme toggle
        elements.themeToggle.addEventListener('click', toggleTheme);
        
        // Date picker buttons
        elements.selectDateBtn.addEventListener('click', showDatePickerModal);
        elements.clearDateBtn.addEventListener('click', clearDateSelection);
        elements.confirmDateBtn.addEventListener('click', confirmDateTime);
        elements.cancelDateBtn.addEventListener('click', hideDatePickerModal);
        
        // Close date picker modal when clicking outside
        elements.datePickerModal.addEventListener('click', e => {
            if (e.target === elements.datePickerModal) {
                hideDatePickerModal();
            }
        });
        
        // Test sound button
        elements.testSoundBtn.addEventListener('click', () => testSound(elements.alarmSound.value));
        
        // Filter buttons
        elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Set active filter
                currentFilter = btn.getAttribute('data-filter');
                
                // Update active button style
                elements.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Re-render tasks with filter
                renderTasks();
            });
        });
        
        // Notification close button
        elements.notificationClose.addEventListener('click', () => {
            elements.notification.classList.remove('show');
            stopSound();
        });
        
        // Snooze button
        elements.snoozeBtn.addEventListener('click', snoozeAlarm);
    }
    
    /**
     * Load tasks from localStorage
     */
    function loadTasks() {
        try {
            const savedTasks = localStorage.getItem('tasks');
            if (savedTasks) {
                tasks = JSON.parse(savedTasks);
            }
        } catch (e) {
            console.error('Failed to load tasks from localStorage');
            tasks = [];
        }
    }
    
    /**
     * Save tasks to localStorage
     */
    function saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (e) {
            console.error('Failed to save tasks to localStorage');
        }
    }
    
    /**
     * Add a new task
     */
    function addTask() {
        const text = elements.taskInput.value.trim();
        
        if (!text) {
            // Don't add empty tasks
            elements.taskInput.classList.add('shake');
            setTimeout(() => elements.taskInput.classList.remove('shake'), 500);
            return;
        }
        
        // Create task object
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            backgroundColor: getRandomColor()
        };
        
        // Add alarm time if set
        if (elements.alarmTime.value) {
            task.alarmTime = elements.alarmTime.value;
        }
        
        // Add alarm sound if available
        if (elements.alarmSound.value) {
            task.alarmSound = elements.alarmSound.value;
        }
        
        // Add task to array
        tasks.push(task);
        
        // Save to localStorage
        saveTasks();
        
        // Clear input
        elements.taskInput.value = '';
        
        // Render tasks
        renderTasks();
        
        // Setup alarm if provided
        if (task.alarmTime) {
            setupAlarm(task);
        }
        
        // Return focus to input
        elements.taskInput.focus();
    }
    
    /**
     * Render tasks based on current filter
     */
    function renderTasks() {
        // Clear task list
        elements.taskList.innerHTML = '';
        
        // Get filtered tasks
        let filteredTasks = tasks;
        
        switch (currentFilter) {
            case 'active':
                filteredTasks = tasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = tasks.filter(task => task.completed);
                break;
            case 'alarm':
                filteredTasks = tasks.filter(task => task.alarmTime);
                break;
        }
        
        // Show message if no tasks
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = currentFilter === 'all' 
                ? 'No tasks yet. Add one above!' 
                : `No ${currentFilter} tasks yet.`;
            elements.taskList.appendChild(emptyMessage);
            return;
        }
        
        // Create task items
        filteredTasks.forEach(task => {
            const taskItem = createTaskItem(task);
            elements.taskList.appendChild(taskItem);
        });
        
        // Add event listeners to task buttons
        addTaskButtonListeners();
    }
    
    /**
     * Create a task item element
     */
    function createTaskItem(task) {
        const taskItem = document.createElement('li');
        taskItem.className = 'todo-item';
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        
        // Set background color
        if (task.backgroundColor) {
            taskItem.style.backgroundColor = task.backgroundColor;
        }
        
        // Create alarm info if exists
        let alarmInfo = '';
        if (task.alarmTime) {
            const formattedTime = formatDateTime(task.alarmTime);
            alarmInfo = `
                <div class="todo-item-time">
                    <i class="fas fa-bell"></i>
                    ${formattedTime}
                    <button class="edit-alarm-btn" data-id="${task.id}" title="Edit Alarm Time">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            `;
        }
        
        // Create task HTML
        taskItem.innerHTML = `
            <span class="todo-item-text">${escapeHtml(task.text)}</span>
            ${alarmInfo}
            <div class="todo-item-actions">
                <button class="todo-btn complete-btn" data-id="${task.id}">
                    ${task.completed ? '<i class="fas fa-undo"></i>' : '<i class="fas fa-check"></i>'}
                </button>
                <button class="todo-btn delete-btn" data-id="${task.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        return taskItem;
    }
    
    /**
     * Add event listeners to task buttons
     */
    function addTaskButtonListeners() {
        // Complete buttons
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                toggleTaskCompletion(id);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                deleteTask(id);
            });
        });
        
        // Edit alarm buttons
        document.querySelectorAll('.edit-alarm-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                editTaskAlarm(id);
            });
        });
        
        // Make task item clickable
        document.querySelectorAll('.todo-item').forEach(item => {
            item.addEventListener('click', () => {
                const completeBtn = item.querySelector('.complete-btn');
                if (completeBtn) {
                    const id = parseInt(completeBtn.getAttribute('data-id'));
                    toggleTaskCompletion(id);
                }
            });
        });
    }
    
    /**
     * Toggle task completion status
     */
    function toggleTaskCompletion(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
    }
    
    /**
     * Delete a task
     */
    function deleteTask(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex !== -1) {
            // Animate removal
            const taskElement = document.querySelector(`.todo-item:has(.delete-btn[data-id="${id}"])`);
            
            if (taskElement) {
                taskElement.style.transform = 'translateX(100px)';
                taskElement.style.opacity = '0';
                
                setTimeout(() => {
                    // Remove from array
                    tasks.splice(taskIndex, 1);
                    saveTasks();
                    renderTasks();
                }, 300);
            } else {
                // Remove without animation
                tasks.splice(taskIndex, 1);
                saveTasks();
                renderTasks();
            }
        }
    }
    
    /**
     * Set up date picker with default values
     */
    function setupDatePicker() {
        // Set default values to current date/time + 1 hour
        const now = new Date();
        now.setHours(now.getHours() + 1);
        
        if (elements.datePicker) {
            elements.datePicker.valueAsDate = now;
        }
        
        if (elements.timePicker) {
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            elements.timePicker.value = `${hours}:${minutes}`;
        }
    }
    
    /**
     * Show date picker modal
     */
    function showDatePickerModal() {
        if (!elements.datePickerModal) return;
        
        // If alarm time is already set, use it to populate the picker
        if (elements.alarmTime.value) {
            const dateObj = new Date(elements.alarmTime.value);
            
            if (!isNaN(dateObj.getTime())) {
                // Set date value
                const dateStr = dateObj.toISOString().split('T')[0];
                elements.datePicker.value = dateStr;
                
                // Set time value
                const hours = dateObj.getHours().toString().padStart(2, '0');
                const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                elements.timePicker.value = `${hours}:${minutes}`;
            }
        }
        
        // Show modal
        elements.datePickerModal.classList.add('show');
    }
    
    /**
     * Hide date picker modal
     */
    function hideDatePickerModal() {
        if (elements.datePickerModal) {
            elements.datePickerModal.classList.remove('show');
        }
    }
    
    /**
     * Clear date selection
     */
    function clearDateSelection() {
        if (elements.alarmTime) {
            elements.alarmTime.value = '';
        }
    }
    
    /**
     * Confirm date time selection
     */
    function confirmDateTime() {
        if (!elements.datePicker || !elements.timePicker) return;
        
        const selectedDate = elements.datePicker.value;
        const selectedTime = elements.timePicker.value;
        
        if (!selectedDate || !selectedTime) {
            showNotification('Please select both date and time', 2000);
            return;
        }
        
        // Create date string in format YYYY-MM-DDTHH:MM
        const dateTimeString = `${selectedDate}T${selectedTime}`;
        
        // Check if date is in the future
        const selectedDateTime = new Date(dateTimeString);
        const now = new Date();
        
        if (selectedDateTime <= now) {
            showNotification('Please select a future date and time', 2000);
            return;
        }
        
        // Set the datetime-local input value
        elements.alarmTime.value = dateTimeString;
        
        // Hide modal
        hideDatePickerModal();
    }
    
    /**
     * Edit a task's alarm
     */
    function editTaskAlarm(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Set date picker values from task
        if (task.alarmTime) {
            const dateObj = new Date(task.alarmTime);
            
            if (!isNaN(dateObj.getTime())) {
                // Set datepicker date value
                const dateStr = dateObj.toISOString().split('T')[0];
                elements.datePicker.value = dateStr;
                
                // Set timepicker time value
                const hours = dateObj.getHours().toString().padStart(2, '0');
                const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                elements.timePicker.value = `${hours}:${minutes}`;
            }
        }
        
        // Show modal
        elements.datePickerModal.classList.add('show');
        
        // Temporarily store task ID for update
        elements.datePickerModal.dataset.editingTaskId = taskId;
        
        // Override confirm button click handler temporarily
        const originalClickHandler = elements.confirmDateBtn.onclick;
        
        elements.confirmDateBtn.onclick = () => {
            const selectedDate = elements.datePicker.value;
            const selectedTime = elements.timePicker.value;
            
            if (!selectedDate || !selectedTime) {
                showNotification('Please select both date and time', 2000);
                return;
            }
            
            // Create date string
            const dateTimeString = `${selectedDate}T${selectedTime}`;
            
            // Check if date is in the future
            const selectedDateTime = new Date(dateTimeString);
            const now = new Date();
            
            if (selectedDateTime <= now) {
                showNotification('Please select a future date and time', 2000);
                return;
            }
            
            // Update task
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].alarmTime = dateTimeString;
                
                // Save and render
                saveTasks();
                renderTasks();
                
                // Setup alarm
                setupAlarm(tasks[taskIndex]);
                
                // Show confirmation
                showNotification('Alarm updated successfully', 2000);
            }
            
            // Hide modal
            hideDatePickerModal();
            
            // Restore original click handler
            elements.confirmDateBtn.onclick = originalClickHandler;
        };
    }
    
    /**
     * Set up an alarm for a task
     */
    function setupAlarm(task) {
        if (!task.alarmTime) return;
        
        const alarmTime = new Date(task.alarmTime).getTime();
        const now = new Date().getTime();
        
        // Only set alarm if it's in the future
        if (alarmTime > now) {
            const timeUntilAlarm = alarmTime - now;
            
            // Set timeout
            setTimeout(() => {
                // Check if task still exists and is not completed
                const currentTask = tasks.find(t => t.id === task.id);
                if (currentTask && !currentTask.completed) {
                    triggerAlarm(currentTask);
                }
            }, timeUntilAlarm);
        }
    }
    
    /**
     * Trigger alarm for a task
     */
    function triggerAlarm(task) {
        // Set current alarm task for snooze functionality
        currentAlarmTask = task;
        
        // Set notification message
        elements.notificationMessage.textContent = `Time to complete: ${task.text}`;
        
        // Show notification
        elements.notification.classList.add('show');
        
        // Play alarm sound
        playSound(task.alarmSound || 'sound1');
        
        // Vibrate if supported
        if ('vibrate' in navigator) {
            navigator.vibrate([300, 100, 300, 100, 300]);
        }
    }
    
    /**
     * Snooze the current alarm
     */
    function snoozeAlarm() {
        if (!currentAlarmTask) return;
        
        // Get snooze time
        const snoozeMinutes = parseInt(elements.snoozeTime.value) || 5;
        
        // Calculate new alarm time
        const now = new Date();
        now.setMinutes(now.getMinutes() + snoozeMinutes);
        
        // Update task
        const taskIndex = tasks.findIndex(t => t.id === currentAlarmTask.id);
        if (taskIndex !== -1) {
            tasks[taskIndex].alarmTime = now.toISOString();
            
            // Save and render
            saveTasks();
            renderTasks();
            
            // Set up new alarm
            setupAlarm(tasks[taskIndex]);
        }
        
        // Hide notification and stop sound
        elements.notification.classList.remove('show');
        stopSound();
        
        // Clear current alarm task
        currentAlarmTask = null;
    }
    
    /**
     * Play a sound
     */
    function playSound(soundId) {
        // Stop any playing sounds first
        stopSound();
        
        // Default to sound1 if not specified
        soundId = soundId || 'sound1';
        
        const audio = audioElements[soundId];
        if (audio) {
            try {
                audio.currentTime = 0;
                audio.loop = true;
                audio.play().catch(e => {
                    console.error('Failed to play sound:', e);
                });
            } catch (e) {
                console.error('Error playing sound:', e);
            }
        }
    }
    
    /**
     * Test a sound (non-looping)
     */
    function testSound(soundId) {
        // Stop any playing sounds first
        stopSound();
        
        // Default to sound1 if not specified
        soundId = soundId || 'sound1';
        
        const audio = audioElements[soundId];
        if (audio) {
            try {
                // Show visual feedback
                elements.testSoundBtn.classList.add('playing');
                
                // Play sound
                audio.currentTime = 0;
                audio.loop = false;
                
                audio.play().catch(e => {
                    console.error('Failed to play test sound:', e);
                    elements.testSoundBtn.classList.remove('playing');
                });
                
                // Remove visual feedback when done
                audio.onended = () => {
                    elements.testSoundBtn.classList.remove('playing');
                };
                
                // Safety timeout
                setTimeout(() => {
                    elements.testSoundBtn.classList.remove('playing');
                }, 3000);
            } catch (e) {
                console.error('Error testing sound:', e);
                elements.testSoundBtn.classList.remove('playing');
            }
        }
    }
    
    /**
     * Stop all sounds
     */
    function stopSound() {
        Object.values(audioElements).forEach(audio => {
            try {
                audio.pause();
                audio.currentTime = 0;
            } catch (e) {
                console.error('Error stopping sound:', e);
            }
        });
    }
    
    /**
     * Toggle theme between light and dark
     */
    function toggleTheme() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            elements.themeToggle.querySelector('i').classList.remove('fa-sun');
            elements.themeToggle.querySelector('i').classList.add('fa-moon');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            elements.themeToggle.querySelector('i').classList.remove('fa-moon');
            elements.themeToggle.querySelector('i').classList.add('fa-sun');
        }
    }
    
    /**
     * Apply theme from localStorage
     */
    function applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            if (elements.themeToggle && elements.themeToggle.querySelector('i')) {
                elements.themeToggle.querySelector('i').classList.remove('fa-moon');
                elements.themeToggle.querySelector('i').classList.add('fa-sun');
            }
        }
    }
    
    /**
     * Format a date-time string to be user-friendly
     */
    function formatDateTime(dateTimeString) {
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateTimeString;
        }
    }
    
    /**
     * Show a notification message
     */
    function showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'temp-notification';
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%) translateY(100px)',
            padding: '10px 20px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '4px',
            zIndex: '1000',
            transition: 'all 0.3s ease'
        });
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(100px)';
            
            // Remove from DOM after animation
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    /**
     * Get a random background color for tasks
     */
    function getRandomColor() {
        const colors = [
            'rgba(255, 105, 180, 0.3)', // Hot pink
            'rgba(138, 43, 226, 0.3)',  // BlueViolet
            'rgba(30, 144, 255, 0.3)',  // DodgerBlue
            'rgba(50, 205, 50, 0.3)',   // LimeGreen
            'rgba(255, 165, 0, 0.3)',   // Orange
            'rgba(106, 90, 205, 0.3)',  // SlateBlue
            'rgba(0, 191, 255, 0.3)',   // DeepSkyBlue
            'rgba(255, 20, 147, 0.3)',  // DeepPink
            'rgba(75, 0, 130, 0.3)',    // Indigo
            'rgba(255, 69, 0, 0.3)'     // OrangeRed
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * Escape HTML to prevent XSS attacks
     */
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}); 