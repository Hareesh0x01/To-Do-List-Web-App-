/**
 * Funky To-Do List App
 * Fully functional implementation with original design
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        taskInput: document.getElementById('taskInput'),
        alarmTime: document.getElementById('alarmTime'),
        alarmSound: document.getElementById('alarmSound'),
        addBtn: document.getElementById('addBtn'),
        taskList: document.getElementById('taskList'),
        themeToggle: document.getElementById('themeToggle'),
        datePickerModal: document.getElementById('datePickerModal'),
        datePicker: document.getElementById('datePicker'),
        timePicker: document.getElementById('timePicker'),
        confirmDateBtn: document.getElementById('confirmDateBtn'),
        cancelDateBtn: document.getElementById('cancelDateBtn'),
        selectDateBtn: document.getElementById('selectDateBtn'),
        clearDateBtn: document.getElementById('clearDateBtn'),
        filterBtns: document.querySelectorAll('.filter-btn'),
        notification: document.getElementById('notification'),
        notificationMessage: document.getElementById('notification-message'),
        notificationClose: document.getElementById('notification-close'),
        snoozeBtn: document.getElementById('snooze-btn'),
        snoozeTime: document.getElementById('snoozeTime'),
        testSoundBtn: document.getElementById('testSoundBtn'),
        audioErrorContainer: document.getElementById('audioErrorContainer')
    };
    
    // Audio elements
    const audioElements = {};
    for (let i = 1; i <= 5; i++) {
        const audio = document.getElementById(`sound${i}`);
        if (audio) {
            audioElements[`sound${i}`] = audio;
        }
    }
    
    // Variables
    let tasks = [];
    let currentFilter = 'all';
    let currentAlarmTask = null;
    let alarmTimers = [];
    
    // Initialize
    initialize();
    
    /**
     * Initialize the application
     */
    function initialize() {
        console.log('Initializing app...');
        
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
        
        // Set up alarms for existing tasks
        setupExistingAlarms();
        
        console.log('App initialization complete');
    }
    
    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Add task button
        if (elements.addBtn) {
            elements.addBtn.addEventListener('click', addTask);
            console.log('Add button event listener attached');
        }
        
        // Add task on Enter key in input field
        if (elements.taskInput) {
            elements.taskInput.addEventListener('keypress', e => {
                if (e.key === 'Enter') addTask();
            });
            console.log('Task input event listener attached');
        }
        
        // Theme toggle
        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', toggleTheme);
            console.log('Theme toggle event listener attached');
        }
        
        // Date picker buttons
        if (elements.selectDateBtn) {
            elements.selectDateBtn.addEventListener('click', showDatePickerModal);
            console.log('Select date button event listener attached');
        }
        
        if (elements.clearDateBtn) {
            elements.clearDateBtn.addEventListener('click', clearDateSelection);
            console.log('Clear date button event listener attached');
        }
        
        if (elements.confirmDateBtn) {
            elements.confirmDateBtn.addEventListener('click', confirmDateTime);
            console.log('Confirm date button event listener attached');
        }
        
        if (elements.cancelDateBtn) {
            elements.cancelDateBtn.addEventListener('click', hideDatePickerModal);
            console.log('Cancel date button event listener attached');
        }
        
        // Close date picker modal when clicking outside
        if (elements.datePickerModal) {
            elements.datePickerModal.addEventListener('click', e => {
                if (e.target === elements.datePickerModal) {
                    hideDatePickerModal();
                }
            });
            console.log('Date picker modal event listener attached');
        }
        
        // Test sound button
        if (elements.testSoundBtn) {
            elements.testSoundBtn.addEventListener('click', () => {
                testSound(elements.alarmSound.value);
            });
            console.log('Test sound button event listener attached');
        }
        
        // Filter buttons
        if (elements.filterBtns) {
            elements.filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    currentFilter = btn.getAttribute('data-filter');
                    
                    // Update active button style
                    elements.filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Re-render tasks with filter
                    renderTasks();
                });
            });
            console.log('Filter buttons event listeners attached');
        }
        
        // Notification close button
        if (elements.notificationClose) {
            elements.notificationClose.addEventListener('click', () => {
                hideNotification();
            });
            console.log('Notification close button event listener attached');
        }
        
        // Snooze button
        if (elements.snoozeBtn) {
            elements.snoozeBtn.addEventListener('click', snoozeAlarm);
            console.log('Snooze button event listener attached');
        }
    }
    
    /**
     * Load tasks from localStorage
     */
    function loadTasks() {
        try {
            const savedTasks = localStorage.getItem('funkyTasks');
            if (savedTasks) {
                tasks = JSON.parse(savedTasks);
                console.log(`Loaded ${tasks.length} tasks from localStorage`);
            } else {
                console.log('No tasks found in localStorage');
            }
        } catch (e) {
            console.error('Failed to load tasks from localStorage:', e);
            tasks = [];
        }
    }
    
    /**
     * Save tasks to localStorage
     */
    function saveTasks() {
        try {
            localStorage.setItem('funkyTasks', JSON.stringify(tasks));
            console.log(`Saved ${tasks.length} tasks to localStorage`);
        } catch (e) {
            console.error('Failed to save tasks to localStorage:', e);
            showTemporaryNotification('Failed to save tasks. Storage may be full.', 3000);
        }
    }
    
    /**
     * Add a new task
     */
    function addTask() {
        const text = elements.taskInput.value.trim();
        
        if (!text) {
            // Shake animation for empty input
            elements.taskInput.classList.add('vibrate');
            setTimeout(() => elements.taskInput.classList.remove('vibrate'), 500);
            return;
        }
        
        console.log(`Adding new task: ${text}`);
        
        // Create task object
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            timestamp: new Date().toISOString()
        };
        
        // Add alarm time if set
        if (elements.alarmTime && elements.alarmTime.value) {
            task.alarmTime = elements.alarmTime.value;
            console.log(`Task has alarm set for: ${task.alarmTime}`);
        }
        
        // Add alarm sound if available
        if (elements.alarmSound && elements.alarmSound.value) {
            task.alarmSound = elements.alarmSound.value;
            console.log(`Task has alarm sound: ${task.alarmSound}`);
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
        
        console.log('Task added successfully');
    }
    
    /**
     * Render tasks based on current filter
     */
    function renderTasks() {
        // Clear task list
        if (!elements.taskList) {
            console.error('Task list element not found');
            return;
        }
        
        elements.taskList.innerHTML = '';
        console.log(`Rendering tasks with filter: ${currentFilter}`);
        
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
        
        // Sort tasks by creation time (newest first)
        filteredTasks.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        console.log(`Displaying ${filteredTasks.length} tasks`);
        
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
        taskItem.dataset.id = task.id;
        
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        
        // Create task HTML
        let taskContent = `
            <div class="todo-item-text user-content">${escapeHtml(task.text)}</div>
            <div class="todo-item-info">
        `;
        
        // Add alarm info if exists
        if (task.alarmTime) {
            const formattedTime = formatDateTime(task.alarmTime);
            taskContent += `
                <div class="todo-item-time">
                    <i class="fas fa-bell"></i> ${formattedTime}
                    <button class="edit-alarm-btn" data-id="${task.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            `;
        }
        
        // Add sound info if exists
        if (task.alarmSound) {
            const soundNames = {
                'sound1': 'Classic Beep',
                'sound2': 'Fun Chime',
                'sound3': 'Funky Beat',
                'sound4': 'Alert Buzz',
                'sound5': 'Gentle Bell'
            };
            
            const soundName = soundNames[task.alarmSound] || 'Sound';
            
            taskContent += `
                <div class="todo-item-sound">
                    <i class="fas fa-volume-up"></i> ${soundName}
                </div>
            `;
        }
        
        taskContent += `
            </div>
            <div class="todo-item-actions">
                <button class="todo-btn complete-btn" data-id="${task.id}">
                    ${task.completed ? '<i class="fas fa-undo"></i>' : '<i class="fas fa-check"></i>'}
                </button>
                <button class="todo-btn delete-btn" data-id="${task.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        taskItem.innerHTML = taskContent;
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
                const id = parseInt(item.dataset.id);
                toggleTaskCompletion(id);
            });
        });
    }
    
    /**
     * Toggle task completion status
     */
    function toggleTaskCompletion(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            console.log(`Task ${id} completion toggled to: ${tasks[taskIndex].completed}`);
            saveTasks();
            renderTasks();
        } else {
            console.error(`Task with ID ${id} not found`);
        }
    }
    
    /**
     * Delete a task
     */
    function deleteTask(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex !== -1) {
            console.log(`Deleting task: ${tasks[taskIndex].text}`);
            
            // Clear any alarm timers for this task
            clearAlarmsForTask(tasks[taskIndex]);
            
            // Animate removal
            const taskElement = document.querySelector(`.todo-item[data-id="${id}"]`);
            
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
        } else {
            console.error(`Task with ID ${id} not found for deletion`);
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
            try {
                elements.datePicker.valueAsDate = now;
                console.log('Date picker default date set');
            } catch (e) {
                console.error('Error setting date picker date:', e);
                
                // Fallback method
                const dateStr = now.toISOString().split('T')[0];
                elements.datePicker.value = dateStr;
            }
        }
        
        if (elements.timePicker) {
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            elements.timePicker.value = `${hours}:${minutes}`;
            console.log('Time picker default time set');
        }
    }
    
    /**
     * Show date picker modal
     */
    function showDatePickerModal() {
        if (!elements.datePickerModal) {
            console.error('Date picker modal element not found');
            return;
        }
        
        console.log('Showing date picker modal');
        
        // If alarm time is already set, use it to populate the picker
        if (elements.alarmTime && elements.alarmTime.value) {
            const dateObj = new Date(elements.alarmTime.value);
            
            if (!isNaN(dateObj.getTime())) {
                // Set date value
                const dateStr = dateObj.toISOString().split('T')[0];
                elements.datePicker.value = dateStr;
                
                // Set time value
                const hours = dateObj.getHours().toString().padStart(2, '0');
                const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                elements.timePicker.value = `${hours}:${minutes}`;
                
                console.log('Populated date picker with existing alarm time');
            }
        }
        
        // Show modal with animation
        elements.datePickerModal.style.display = 'flex';
        setTimeout(() => {
            elements.datePickerModal.classList.add('show');
        }, 10);
    }
    
    /**
     * Hide date picker modal
     */
    function hideDatePickerModal() {
        if (!elements.datePickerModal) {
            console.error('Date picker modal element not found');
            return;
        }
        
        console.log('Hiding date picker modal');
        
        // Hide with animation
        elements.datePickerModal.classList.remove('show');
        setTimeout(() => {
            // Only set display to none after animation completes
            elements.datePickerModal.style.display = 'none';
            
            // Clear any temporary task ID stored for editing
            delete elements.datePickerModal.dataset.editingTaskId;
        }, 300);
    }
    
    /**
     * Hide notification
     */
    function hideNotification() {
        if (!elements.notification) {
            console.error('Notification element not found');
            return;
        }
        
        console.log('Hiding notification');
        
        // Hide with animation
        elements.notification.classList.remove('show');
        setTimeout(() => {
            // Only set display to none after animation completes
            elements.notification.style.display = 'none';
        }, 300);
        
        // Stop sound
        stopSound();
    }
    
    /**
     * Clear date selection
     */
    function clearDateSelection() {
        if (elements.alarmTime) {
            elements.alarmTime.value = '';
            console.log('Date selection cleared');
        }
    }
    
    /**
     * Confirm date time selection
     */
    function confirmDateTime() {
        if (!elements.datePicker || !elements.timePicker) {
            console.error('Date or time picker elements not found');
            return;
        }
        
        const selectedDate = elements.datePicker.value;
        const selectedTime = elements.timePicker.value;
        
        if (!selectedDate || !selectedTime) {
            showTemporaryNotification('Please select both date and time', 2000);
            console.warn('Date or time not selected');
            return;
        }
        
        console.log(`Selected date: ${selectedDate}, time: ${selectedTime}`);
        
        // Create date string in format YYYY-MM-DDTHH:MM
        const dateTimeString = `${selectedDate}T${selectedTime}`;
        
        // Check if date is in the future
        const selectedDateTime = new Date(dateTimeString);
        const now = new Date();
        
        if (selectedDateTime <= now) {
            showTemporaryNotification('Please select a future date and time', 2000);
            console.warn('Selected time is not in the future');
            return;
        }
        
        // Check if we're editing an existing task
        const editingTaskId = elements.datePickerModal.dataset.editingTaskId;
        if (editingTaskId) {
            const taskId = parseInt(editingTaskId);
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            
            if (taskIndex !== -1) {
                console.log(`Updating alarm for task: ${tasks[taskIndex].text}`);
                
                // Clear existing alarm
                clearAlarmsForTask(tasks[taskIndex]);
                
                // Update task
                tasks[taskIndex].alarmTime = dateTimeString;
                
                // Setup new alarm
                setupAlarm(tasks[taskIndex]);
                
                // Save and render
                saveTasks();
                renderTasks();
                
                showTemporaryNotification('Alarm updated successfully', 2000);
            } else {
                console.error(`Task with ID ${taskId} not found for alarm update`);
            }
        } else {
            // Set the datetime-local input value
            if (elements.alarmTime) {
                elements.alarmTime.value = dateTimeString;
                console.log('Set alarm time in input field');
            }
        }
        
        // Hide modal
        hideDatePickerModal();
    }
    
    /**
     * Edit a task's alarm
     */
    function editTaskAlarm(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            console.error(`Task with ID ${taskId} not found for editing alarm`);
            return;
        }
        
        console.log(`Editing alarm for task: ${task.text}`);
        
        // Store the task ID in the modal's dataset for later reference
        if (elements.datePickerModal) {
            elements.datePickerModal.dataset.editingTaskId = taskId;
        }
        
        // Set date picker values from task
        if (task.alarmTime && elements.datePicker && elements.timePicker) {
            const dateObj = new Date(task.alarmTime);
            
            if (!isNaN(dateObj.getTime())) {
                // Set datepicker date value
                const dateStr = dateObj.toISOString().split('T')[0];
                elements.datePicker.value = dateStr;
                
                // Set timepicker time value
                const hours = dateObj.getHours().toString().padStart(2, '0');
                const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                elements.timePicker.value = `${hours}:${minutes}`;
                
                console.log('Populated date picker with task alarm time');
            }
        }
        
        // Show modal
        showDatePickerModal();
    }
    
    /**
     * Setup existing alarms when app loads
     */
    function setupExistingAlarms() {
        console.log('Setting up alarms for existing tasks');
        
        let alarmsSetup = 0;
        tasks.forEach(task => {
            if (task.alarmTime && !task.completed) {
                setupAlarm(task);
                alarmsSetup++;
            }
        });
        
        console.log(`${alarmsSetup} alarms set up for existing tasks`);
    }
    
    /**
     * Clear alarms for a task
     */
    function clearAlarmsForTask(task) {
        if (!task || !task.id) {
            console.error('Invalid task provided to clearAlarmsForTask');
            return;
        }
        
        console.log(`Clearing alarms for task: ${task.text}`);
        
        // Filter alarmTimers to remove any for this task
        const initialLength = alarmTimers.length;
        alarmTimers = alarmTimers.filter(timer => {
            if (timer.taskId === task.id) {
                clearTimeout(timer.timerId);
                return false;
            }
            return true;
        });
        
        console.log(`Cleared ${initialLength - alarmTimers.length} alarm timers`);
    }
    
    /**
     * Set up an alarm for a task
     */
    function setupAlarm(task) {
        if (!task || !task.alarmTime || task.completed) {
            console.warn('Invalid task or alarm not needed');
            return;
        }
        
        const alarmTime = new Date(task.alarmTime).getTime();
        const now = new Date().getTime();
        
        console.log(`Setting up alarm for task "${task.text}" at ${new Date(alarmTime).toLocaleString()}`);
        
        // Only set alarm if it's in the future
        if (alarmTime > now) {
            const timeUntilAlarm = alarmTime - now;
            console.log(`Alarm will trigger in ${Math.round(timeUntilAlarm/1000/60)} minutes`);
            
            // Set timeout
            const timerId = setTimeout(() => {
                // Remove this timer from alarmTimers
                alarmTimers = alarmTimers.filter(timer => timer.timerId !== timerId);
                
                // Check if task still exists and is not completed
                const currentTask = tasks.find(t => t.id === task.id);
                if (currentTask && !currentTask.completed) {
                    triggerAlarm(currentTask);
                } else {
                    console.log('Task completed or deleted before alarm triggered');
                }
            }, timeUntilAlarm);
            
            // Store timer reference
            alarmTimers.push({
                taskId: task.id,
                timerId: timerId
            });
            
            console.log(`Alarm timer set with ID: ${timerId}`);
        } else {
            console.warn('Alarm time is in the past, not setting alarm');
        }
    }
    
    /**
     * Trigger alarm for a task
     */
    function triggerAlarm(task) {
        if (!task) {
            console.error('Invalid task provided to triggerAlarm');
            return;
        }
        
        console.log(`Triggering alarm for task: ${task.text}`);
        
        // Set current alarm task for snooze functionality
        currentAlarmTask = task;
        
        // Set notification message
        if (elements.notificationMessage) {
            elements.notificationMessage.textContent = task.text;
        }
        
        // Show notification - first ensure it's display:flex
        if (elements.notification) {
            elements.notification.style.display = 'flex';
            // Use a small timeout to ensure display change has taken effect
            setTimeout(() => {
                elements.notification.classList.add('show');
            }, 10);
        } else {
            console.error('Notification element not found');
        }
        
        // Play alarm sound
        playSound(task.alarmSound || 'sound1');
        
        // Vibrate if supported
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate([300, 100, 300, 100, 300]);
                console.log('Device vibration activated');
            } catch (e) {
                console.warn('Vibration failed:', e);
            }
        }
    }
    
    /**
     * Snooze the current alarm
     */
    function snoozeAlarm() {
        if (!currentAlarmTask) {
            console.warn('No active alarm to snooze');
            return;
        }
        
        // Get snooze time
        const snoozeMinutes = parseInt(elements.snoozeTime ? elements.snoozeTime.value : 5) || 5;
        
        console.log(`Snoozing alarm for task "${currentAlarmTask.text}" by ${snoozeMinutes} minutes`);
        
        // Calculate new alarm time
        const now = new Date();
        now.setMinutes(now.getMinutes() + snoozeMinutes);
        
        // Clear existing alarm
        clearAlarmsForTask(currentAlarmTask);
        
        // Update task
        const taskIndex = tasks.findIndex(t => t.id === currentAlarmTask.id);
        if (taskIndex !== -1) {
            tasks[taskIndex].alarmTime = now.toISOString();
            
            // Save and render
            saveTasks();
            renderTasks();
            
            // Set up new alarm
            setupAlarm(tasks[taskIndex]);
            
            showTemporaryNotification(`Alarm snoozed for ${snoozeMinutes} minutes`, 2000);
        } else {
            console.error(`Task with ID ${currentAlarmTask.id} not found for snooze`);
        }
        
        // Hide notification and stop sound
        hideNotification();
        
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
        
        console.log(`Playing sound: ${soundId}`);
        
        const audio = audioElements[soundId];
        if (audio) {
            try {
                audio.currentTime = 0;
                audio.loop = true;
                
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        handleAudioError(error, soundId);
                    });
                }
            } catch (e) {
                handleAudioError(e, soundId);
            }
        } else {
            console.error(`Audio element ${soundId} not found`);
        }
    }
    
    /**
     * Handle audio playback errors
     */
    function handleAudioError(error, soundId) {
        console.error('Audio playback error:', error);
        
        if (elements.audioErrorContainer) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'audio-error';
            errorMessage.textContent = 'Audio playback blocked. Click to enable sounds.';
            errorMessage.addEventListener('click', () => {
                testSound(soundId);
                errorMessage.remove();
            });
            
            elements.audioErrorContainer.innerHTML = '';
            elements.audioErrorContainer.appendChild(errorMessage);
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
        
        console.log(`Testing sound: ${soundId}`);
        
        const audio = audioElements[soundId];
        if (audio) {
            try {
                // Show visual feedback
                if (elements.testSoundBtn) {
                    const icon = elements.testSoundBtn.querySelector('i');
                    if (icon) {
                        icon.classList.add('playing');
                    }
                }
                
                // Play sound
                audio.currentTime = 0;
                audio.loop = false;
                
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Failed to play test sound:', error);
                        if (elements.testSoundBtn) {
                            const icon = elements.testSoundBtn.querySelector('i');
                            if (icon) {
                                icon.classList.remove('playing');
                            }
                        }
                    });
                }
                
                // Remove visual feedback when done
                audio.onended = () => {
                    if (elements.testSoundBtn) {
                        const icon = elements.testSoundBtn.querySelector('i');
                        if (icon) {
                            icon.classList.remove('playing');
                        }
                    }
                };
                
                // Safety timeout
                setTimeout(() => {
                    if (elements.testSoundBtn) {
                        const icon = elements.testSoundBtn.querySelector('i');
                        if (icon) {
                            icon.classList.remove('playing');
                        }
                    }
                }, 3000);
            } catch (e) {
                console.error('Error testing sound:', e);
                if (elements.testSoundBtn) {
                    const icon = elements.testSoundBtn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('playing');
                    }
                }
            }
        } else {
            console.error(`Audio element ${soundId} not found for testing`);
        }
    }
    
    /**
     * Stop all sounds
     */
    function stopSound() {
        console.log('Stopping all sounds');
        
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
            localStorage.setItem('funkyTheme', 'light');
            console.log('Theme switched to light mode');
            
            const icon = elements.themeToggle ? elements.themeToggle.querySelector('i') : null;
            if (icon) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('funkyTheme', 'dark');
            console.log('Theme switched to dark mode');
            
            const icon = elements.themeToggle ? elements.themeToggle.querySelector('i') : null;
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    }
    
    /**
     * Apply theme from localStorage
     */
    function applyTheme() {
        const savedTheme = localStorage.getItem('funkyTheme') || 'light';
        
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            console.log('Applied dark theme from local storage');
            
            const icon = elements.themeToggle ? elements.themeToggle.querySelector('i') : null;
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        } else {
            console.log('Applied light theme (default)');
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
            console.error('Error formatting date:', e);
            return dateTimeString;
        }
    }
    
    /**
     * Show a temporary notification message
     */
    function showTemporaryNotification(message, duration = 3000) {
        console.log(`Temporary notification: ${message}`);
        
        // Check if a notification already exists and remove it
        const existingNotification = document.querySelector('.temp-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'temp-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
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