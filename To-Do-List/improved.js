/**
 * Funky To-Do List App - Improved Version
 * All functionality fixed, with optimized code and special features
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const alarmTimeInput = document.getElementById('alarmTime');
    const alarmSoundSelect = document.getElementById('alarmSound');
    const testSoundBtn = document.getElementById('testSoundBtn');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationClose = document.getElementById('notification-close');
    const snoozeBtn = document.getElementById('snooze-btn');
    const snoozeTime = document.getElementById('snoozeTime');
    const themeToggle = document.getElementById('themeToggle');
    const selectDateBtn = document.getElementById('selectDateBtn');
    const clearDateBtn = document.getElementById('clearDateBtn');
    const datePickerModal = document.getElementById('datePickerModal');
    const datePicker = document.getElementById('datePicker');
    const timePicker = document.getElementById('timePicker');
    const cancelDateBtn = document.getElementById('cancelDateBtn');
    const confirmDateBtn = document.getElementById('confirmDateBtn');
    const developerName = document.getElementById('developerName');
    
    // Edit task modal elements
    const editTaskModal = document.getElementById('editTaskModal');
    const editTaskText = document.getElementById('editTaskText');
    const editTaskDate = document.getElementById('editTaskDate');
    const editTaskSound = document.getElementById('editTaskSound');
    const editTestSoundBtn = document.getElementById('editTestSoundBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveEditBtn = document.getElementById('saveEditBtn');
    
    // App install button
    const installAppBtn = document.getElementById('installApp');
    
    // Variables
    let tasks = [];
    let currentFilter = 'all';
    let currentAlarmTask = null;
    let deferredPrompt = null;
    let currentEditTaskId = null;
    let audioPermissionGranted = false;
    
    // Sound mappings
    const soundMap = {
        sound1: 'beep.mp3',
        sound2: 'chime.mp3',
        sound3: 'music.mp3',
        sound4: 'alert.mp3',
        sound5: 'bell.mp3'
    };
    
    // Sound display names
    const soundNames = {
        sound1: 'Classic Beep',
        sound2: 'Fun Chime',
        sound3: 'Funky Beat',
        sound4: 'Alert Buzz',
        sound5: 'Gentle Bell'
    };
    
    // First, enforce audio permissions before initializing
    requestAudioPermission();
    
    /**
     * Request audio permission from user with clear instructions
     */
    function requestAudioPermission() {
        // Create audio permission overlay
        const overlay = document.createElement('div');
        overlay.className = 'audio-permission-overlay';
        overlay.innerHTML = `
            <div class="audio-permission-container">
                <h2>Enable Sound for Alarms</h2>
                <p>This app needs permission to play sounds for alarms to work properly.</p>
                <p>Click the button below to enable sounds:</p>
                <button id="enableAudioBtn" class="enable-audio-btn">
                    <i class="fas fa-volume-up"></i> Enable Sounds
                </button>
                <p class="audio-permission-note">If you don't enable sounds, alarms won't make noise.</p>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Add styles for overlay
        const style = document.createElement('style');
        style.textContent = `
            .audio-permission-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            .audio-permission-container {
                background: white;
                padding: 2rem;
                border-radius: 10px;
                max-width: 500px;
                text-align: center;
                box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
            }
            .enable-audio-btn {
                background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
                color: white;
                border: none;
                padding: 1rem 2rem;
                font-size: 1.2rem;
                border-radius: 50px;
                margin: 1.5rem 0;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                transition: all 0.3s ease;
            }
            .enable-audio-btn:hover {
                transform: scale(1.05);
            }
            .audio-permission-note {
                font-size: 0.8rem;
                opacity: 0.7;
                margin-top: 1rem;
            }
        `;
        document.head.appendChild(style);
        
        // Add button event listener
        const enableBtn = document.getElementById('enableAudioBtn');
        enableBtn.addEventListener('click', function() {
            // Try to play a silent sound to get permission
            const silentSound = document.createElement('audio');
            silentSound.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAANVVV';
            silentSound.volume = 0.01;
            
            const playPromise = silentSound.play();
            
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    console.log('Audio permission granted');
                    audioPermissionGranted = true;
                    overlay.remove();
                    style.remove();
                    
                    // Now we can initialize the app
                    initialize();
                    
                    // Preload all sound files
                    preloadAllSounds();
                    
                }).catch(error => {
                    console.error('Audio permission denied:', error);
                    // Still remove overlay but show warning
                    overlay.remove();
                    style.remove();
                    
                    // Initialize anyway but show warning
                    initialize();
                    showTemporaryNotification('Sound permission denied. Alarms will be silent.', 5000);
                });
            } else {
                // Older browsers that don't return a promise
                console.log('Browser does not support audio promise API');
                overlay.remove();
                style.remove();
                initialize();
            }
        });
    }
    
    /**
     * Preload all sound files to ensure they're ready for playback
     */
    function preloadAllSounds() {
        const sounds = ['sound1', 'sound2', 'sound3', 'sound4', 'sound5'];
        
        sounds.forEach(soundId => {
            const audio = document.getElementById(soundId);
            if (audio) {
                audio.load();
                console.log(`Preloading ${soundId}`);
            }
        });
    }
    
    /**
     * Initialize the app
     */
    function initialize() {
        // Apply saved theme
        applyTheme();
        
        // Load tasks from localStorage
        loadTasks();
        
        // Render tasks
        renderTasks();
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup date picker
        setupDatePicker();
        
        // Setup existing alarms
        setupExistingAlarms();
        
        // Setup developer name animation
        animateDeveloperName();
        
        // Setup PWA installation
        setupPWAInstall();
        
        // Pre-load and unlock audio to help with autoplay restrictions
        unlockAudioContext();
        
        // Show welcome message
        showTemporaryNotification('Welcome to the Funky To-Do List App! 🎉', 3000);
        
        // Add this at the end of your initialize function
        window.appInitialized = true;
        console.log('App initialized successfully');
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Add task button
        addBtn.addEventListener('click', addTask);
        
        // Enter key on task input
        taskInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
        
        // Filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                currentFilter = filter;
                
                // Update active class
                filterBtns.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Re-render tasks with new filter
                renderTasks();
            });
        });
        
        // Test sound button
        testSoundBtn.addEventListener('click', function() {
            const soundId = alarmSoundSelect.value;
            testSound(soundId);
        });
        
        // Edit test sound button
        editTestSoundBtn.addEventListener('click', function() {
            const soundId = editTaskSound.value;
            testSound(soundId);
        });
        
        // Notification close button
        notificationClose.addEventListener('click', function() {
            hideNotification();
            stopSound();
        });
        
        // Snooze button
        snoozeBtn.addEventListener('click', snoozeAlarm);
        
        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);
        
        // Select date button
        selectDateBtn.addEventListener('click', showDatePickerModal);
        
        // Clear date button
        clearDateBtn.addEventListener('click', clearDateSelection);
        
        // Cancel date button
        cancelDateBtn.addEventListener('click', hideDatePickerModal);
        
        // Confirm date button
        confirmDateBtn.addEventListener('click', confirmDateTime);
        
        // Cancel edit button
        cancelEditBtn.addEventListener('click', function() {
            editTaskModal.classList.remove('show');
        });
        
        // Save edit button
        saveEditBtn.addEventListener('click', saveTaskEdit);
    }
    
    /**
     * Load tasks from localStorage
     */
    function loadTasks() {
        const savedTasks = localStorage.getItem('funky-tasks');
        if (savedTasks) {
            try {
                tasks = JSON.parse(savedTasks);
            } catch (e) {
                console.error('Error parsing tasks from localStorage:', e);
                tasks = [];
            }
        }
    }
    
    /**
     * Save tasks to localStorage
     */
    function saveTasks() {
        try {
            localStorage.setItem('funky-tasks', JSON.stringify(tasks));
        } catch (e) {
            console.error('Error saving tasks to localStorage:', e);
            showTemporaryNotification('Error saving tasks! Please check browser storage settings.', 3000);
        }
    }
    
    /**
     * Add a new task
     */
    function addTask() {
        const taskText = taskInput.value.trim();
        const alarmTime = alarmTimeInput.value;
        const alarmSound = alarmSoundSelect.value;
        
        if (taskText === '') {
            // Shake the input to indicate error
            taskInput.classList.add('vibrate');
            setTimeout(() => taskInput.classList.remove('vibrate'), 500);
            
            // Show error message
            showTemporaryNotification('Please enter a task!', 2000);
            return;
        }
        
        // Generate unique ID
        const id = Date.now().toString();
        
        // Create new task object
        const newTask = {
            id: id,
            text: taskText,
            completed: false,
            dateCreated: new Date().toISOString(),
            alarm: alarmTime || null,
            sound: alarmSound
        };
        
        // Add to tasks array
        tasks.unshift(newTask);
        
        // Save tasks
        saveTasks();
        
        // Setup alarm if present
        if (alarmTime) {
            setupAlarm(newTask);
        }
        
        // Clear input
        taskInput.value = '';
        alarmTimeInput.value = '';
        
        // Re-render tasks
        renderTasks();
        
        // Show confirmation
        showTemporaryNotification('Task added successfully! 🚀', 2000);
    }
    
    /**
     * Render tasks based on current filter
     */
    function renderTasks() {
        // Clear task list
        taskList.innerHTML = '';
        
        // Filter tasks
        let filteredTasks = tasks;
        
        switch (currentFilter) {
            case 'active':
                filteredTasks = tasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = tasks.filter(task => task.completed);
                break;
            case 'alarm':
                filteredTasks = tasks.filter(task => task.alarm);
                break;
            default:
                filteredTasks = tasks;
        }
        
        // Check if there are no tasks to display
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'todo-item empty-message';
            
            let message = 'No tasks found';
            switch (currentFilter) {
                case 'active':
                    message = 'No active tasks! 🎉';
                    break;
                case 'completed':
                    message = 'No completed tasks yet. Keep going! 💪';
                    break;
                case 'alarm':
                    message = 'No tasks with alarms. Set a reminder! ⏰';
                    break;
                default:
                    message = 'No tasks yet. Add your first task! ✨';
            }
            
            emptyMessage.textContent = message;
            taskList.appendChild(emptyMessage);
            return;
        }
        
        // Render each task
        filteredTasks.forEach(task => {
            const taskEl = createTaskItem(task);
            taskList.appendChild(taskEl);
        });
        
        // Add task button listeners
        addTaskButtonListeners();
    }
    
    /**
     * Create a task list item
     */
    function createTaskItem(task) {
        const taskEl = document.createElement('li');
        taskEl.className = 'todo-item';
        taskEl.dataset.id = task.id;
        
        if (task.completed) {
            taskEl.classList.add('completed');
        }
        
        // Task text
        const taskText = document.createElement('div');
        taskText.className = 'todo-item-text';
        taskText.textContent = task.text;
        taskEl.appendChild(taskText);
        
        // Task info (alarm time and sound if set)
        if (task.alarm) {
            const taskInfo = document.createElement('div');
            taskInfo.className = 'todo-item-info';
            
            // Format and display alarm time
            const taskTime = document.createElement('span');
            taskTime.className = 'todo-item-time';
            const formattedTime = formatDateTime(task.alarm);
            taskTime.innerHTML = `<i class="fas fa-clock"></i> ${formattedTime}`;
            taskInfo.appendChild(taskTime);
            
            // Display sound type
            const taskSound = document.createElement('span');
            taskSound.className = 'todo-item-sound';
            taskSound.innerHTML = `<i class="fas fa-volume-up"></i> ${soundNames[task.sound]}`;
            taskInfo.appendChild(taskSound);
            
            taskEl.appendChild(taskInfo);
        }
        
        // Task actions
        const taskActions = document.createElement('div');
        taskActions.className = 'todo-item-actions';
        
        // Edit button (only for tasks with alarms)
        if (task.alarm) {
            const editBtn = document.createElement('button');
            editBtn.className = 'todo-btn todo-item-edit-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit Alarm';
            editBtn.dataset.id = task.id;
            taskActions.appendChild(editBtn);
        }
        
        // Complete button
        const completeBtn = document.createElement('button');
        completeBtn.className = 'todo-btn complete-btn';
        completeBtn.innerHTML = task.completed ? 
            '<i class="fas fa-undo"></i>' : 
            '<i class="fas fa-check"></i>';
        completeBtn.title = task.completed ? 'Mark as Incomplete' : 'Mark as Complete';
        completeBtn.dataset.id = task.id;
        taskActions.appendChild(completeBtn);
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'todo-btn delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete Task';
        deleteBtn.dataset.id = task.id;
        taskActions.appendChild(deleteBtn);
        
        taskEl.appendChild(taskActions);
        
        return taskEl;
    }
    
    /**
     * Add event listeners to task buttons
     */
    function addTaskButtonListeners() {
        // Complete buttons
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                toggleTaskCompletion(id);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                deleteTask(id);
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.todo-item-edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                editTaskAlarm(id);
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
            saveTasks();
            renderTasks();
        }
    }
    
    /**
     * Delete a task
     */
    function deleteTask(id) {
        // Find task index
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex !== -1) {
            // Get the task
            const task = tasks[taskIndex];
            
            // Clear any alarms for this task
            clearAlarmsForTask(task);
            
            // Remove from array
            tasks.splice(taskIndex, 1);
            
            // Save tasks
            saveTasks();
            
            // Re-render tasks
            renderTasks();
            
            // Show confirmation
            showTemporaryNotification('Task deleted! 🗑️', 2000);
        }
    }
    
    /**
     * Setup the date picker
     */
    function setupDatePicker() {
        // Set date picker min to current date/time
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        const today = `${year}-${month}-${day}`;
        datePicker.min = today;
        
        // Set time picker default to current time + 30 minutes
        let hours = now.getHours();
        let minutes = now.getMinutes() + 30;
        
        // Adjust for overflow
        if (minutes >= 60) {
            hours = (hours + 1) % 24;
            minutes = minutes % 60;
        }
        
        // Format time
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        timePicker.value = `${formattedHours}:${formattedMinutes}`;
    }
    
    /**
     * Show the date picker modal
     */
    function showDatePickerModal() {
        // Set date picker to today
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        datePicker.value = `${year}-${month}-${day}`;
        
        // Show modal
        datePickerModal.classList.add('show');
    }
    
    /**
     * Hide the date picker modal
     */
    function hideDatePickerModal() {
        datePickerModal.classList.remove('show');
    }
    
    /**
     * Hide alarm notification
     */
    function hideNotification() {
        notification.classList.remove('show');
        currentAlarmTask = null;
    }
    
    /**
     * Clear date selection
     */
    function clearDateSelection() {
        alarmTimeInput.value = '';
        showTemporaryNotification('Alarm time cleared! ⏰', 1500);
    }
    
    /**
     * Confirm date time from picker
     */
    function confirmDateTime() {
        // Get values from date and time pickers
        const selectedDate = datePicker.value;
        const selectedTime = timePicker.value;
        
        if (!selectedDate || !selectedTime) {
            showTemporaryNotification('Please select both date and time! ⏰', 2000);
            return;
        }
        
        // Combine date and time
        const dateTimeValue = `${selectedDate}T${selectedTime}`;
        
        // Check if the selected date/time is in the past
        const selectedDateTime = new Date(dateTimeValue);
        const now = new Date();
        
        if (selectedDateTime <= now) {
            showTemporaryNotification('Please select a future date and time! ⏰', 2000);
            return;
        }
        
        // Set the value in the alarmTime input
        alarmTimeInput.value = dateTimeValue;
        
        // Hide the modal
        hideDatePickerModal();
        
        // Show confirmation
        showTemporaryNotification('Alarm time set! ⏰', 1500);
    }
    
    /**
     * Edit a task's alarm
     */
    function editTaskAlarm(taskId) {
        // Find the task
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Set current edit task ID
        currentEditTaskId = taskId;
        
        // Populate edit fields
        editTaskText.value = task.text;
        editTaskDate.value = task.alarm || '';
        editTaskSound.value = task.sound || 'sound1';
        
        // Show modal
        editTaskModal.classList.add('show');
    }
    
    /**
     * Save task edit
     */
    function saveTaskEdit() {
        if (!currentEditTaskId) return;
        
        // Find the task
        const taskIndex = tasks.findIndex(t => t.id === currentEditTaskId);
        if (taskIndex === -1) return;
        
        const taskText = editTaskText.value.trim();
        const alarmTime = editTaskDate.value;
        const alarmSound = editTaskSound.value;
        
        if (taskText === '') {
            showTemporaryNotification('Task text cannot be empty!', 2000);
            return;
        }
        
        // Clear existing alarms
        clearAlarmsForTask(tasks[taskIndex]);
        
        // Update task
        tasks[taskIndex].text = taskText;
        tasks[taskIndex].alarm = alarmTime || null;
        tasks[taskIndex].sound = alarmSound;
        
        // Save tasks
        saveTasks();
        
        // Setup new alarm if present
        if (alarmTime) {
            setupAlarm(tasks[taskIndex]);
        }
        
        // Hide modal
        editTaskModal.classList.remove('show');
        
        // Reset current edit ID
        currentEditTaskId = null;
        
        // Re-render tasks
        renderTasks();
        
        // Show confirmation
        showTemporaryNotification('Task updated successfully! 🔄', 2000);
    }
    
    /**
     * Setup existing alarms for loaded tasks
     */
    function setupExistingAlarms() {
        tasks.forEach(task => {
            if (task.alarm && !task.completed) {
                setupAlarm(task);
            }
        });
    }
    
    /**
     * Clear alarms for a specific task
     */
    function clearAlarmsForTask(task) {
        if (!task || !task.id) return;
        
        // Find and clear any existing timeout for this task
        const timeoutId = parseInt('timeout_' + task.id);
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        // If this is the current alarm task, hide notification
        if (currentAlarmTask && currentAlarmTask.id === task.id) {
            hideNotification();
            stopSound();
        }
    }
    
    /**
     * Setup an alarm for a task
     */
    function setupAlarm(task) {
        if (!task.alarm || task.completed) return;
        
        // Calculate time until alarm
        const alarmTime = new Date(task.alarm).getTime();
        const now = new Date().getTime();
        const timeUntilAlarm = alarmTime - now;
        
        // If alarm time is in the past, don't set alarm
        if (timeUntilAlarm <= 0) return;
        
        // Set timeout for alarm
        const timeoutId = setTimeout(() => {
            triggerAlarm(task);
        }, timeUntilAlarm);
        
        // Store timeout ID with task ID as property name
        window['timeout_' + task.id] = timeoutId;
    }
    
    /**
     * Trigger an alarm for a task
     */
    function triggerAlarm(task) {
        // Set as current alarm task
        currentAlarmTask = task;
        
        // Set notification message with the requested text
        notificationMessage.textContent = "It's time! You set an alarm for this time.";
        
        // Show notification
        notification.classList.add('show');
        notification.classList.add('vibrate');
        
        // Vibrate device if supported
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
        
        // Play alarm sound at maximum volume
        playSound(task.sound || 'sound1', true);
        
        // Flash the tab title to get attention
        let originalTitle = document.title;
        let alertTitle = "⏰ ALARM: " + task.text;
        let titleInterval = setInterval(() => {
            document.title = document.title === originalTitle ? alertTitle : originalTitle;
        }, 1000);
        
        // Clear title flashing when notification is dismissed
        notificationClose.addEventListener('click', function onceListener() {
            clearInterval(titleInterval);
            document.title = originalTitle;
            notification.classList.remove('vibrate');
            notificationClose.removeEventListener('click', onceListener);
        }, { once: true });
        
        // Request notification permission and show system notification
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    const notification = new Notification('Task Reminder', {
                        body: "It's time! You set an alarm for this time.",
                        icon: 'icons/icon-192x192.png',
                        requireInteraction: true,
                        silent: false
                    });
                    
                    // Play sound again when notification is clicked
                    notification.onclick = function() {
                        playSound(task.sound || 'sound1', true);
                        window.focus();
                    };
                }
            });
        }
    }
    
    /**
     * Snooze the current alarm
     */
    function snoozeAlarm() {
        if (!currentAlarmTask) return;
        
        // Get snooze duration in minutes
        const snoozeDuration = parseInt(snoozeTime.value) || 5;
        
        // Calculate new alarm time
        const now = new Date();
        now.setMinutes(now.getMinutes() + snoozeDuration);
        const newAlarmTime = now.toISOString();
        
        // Update task
        const taskIndex = tasks.findIndex(task => task.id === currentAlarmTask.id);
        if (taskIndex !== -1) {
            tasks[taskIndex].alarm = newAlarmTime;
            saveTasks();
            
            // Setup new alarm
            setupAlarm(tasks[taskIndex]);
        }
        
        // Hide notification and stop sound
        hideNotification();
        stopSound();
        
        // Show confirmation
        showTemporaryNotification(`Alarm snoozed for ${snoozeDuration} minutes! 💤`, 2000);
    }
    
    /**
     * Play a sound
     */
    function playSound(soundId, isAlarm = false) {
        try {
            // Stop any currently playing sounds
            stopSound();
            
            // Get audio element
            const audio = document.getElementById(soundId);
            if (!audio) return;
            
            // Create floating music notes for visual effect
            createMusicNotes();
            
            // Add playing class to animate icon
            const soundButtons = document.querySelectorAll('.test-sound-btn');
            soundButtons.forEach(btn => btn.classList.add('playing'));
            
            // Force load the audio before playing (helps with autoplay restrictions)
            audio.load();
            
            // Set maximum volume for alarms to ensure they're heard
            if (isAlarm) {
                audio.volume = 1.0;
            } else {
                audio.volume = 0.8; // Slightly lower for test sounds
            }
            
            // Setup audio
            audio.loop = isAlarm; // Only loop for actual alarms
            
            // For alarms, use multiple aggressive play attempts
            if (isAlarm) {
                // First direct attempt
                forcePlayAudio(audio);
                
                // Scheduled attempts over the next 3 seconds to overcome autoplay restrictions
                for (let i = 1; i <= 5; i++) {
                    setTimeout(() => forcePlayAudio(audio), i * 600);
                }
                
                // Vibrate device more intensely if sound can't be played
                if ('vibrate' in navigator) {
                    navigator.vibrate([300, 100, 300, 100, 300, 100, 300]);
                }
            } else {
                // For test sounds, just try once
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Error playing test sound:', error);
                        showTemporaryNotification('Click the screen to enable sounds', 2000);
                    });
                }
            }
        } catch (error) {
            console.error('Error in playSound function:', error);
            // Fallback to vibration if sound fails
            if ('vibrate' in navigator) {
                navigator.vibrate([500, 100, 500, 100, 500]);
            }
        }
    }
    
    /**
     * Create floating music notes for visual effect
     */
    function createMusicNotes() {
        // Music note symbols
        const notes = ['♪', '♫', '♬', '♩', '♭', '♮'];
        
        // Create 3-5 notes in random positions
        const notesCount = Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < notesCount; i++) {
            setTimeout(() => {
                // Create note element
                const note = document.createElement('div');
                note.className = 'music-note';
                note.textContent = notes[Math.floor(Math.random() * notes.length)];
                
                // Position near sound button or notification
                const container = document.querySelector('.sound-option') || document.querySelector('.notification');
                if (container) {
                    const rect = container.getBoundingClientRect();
                    
                    // Random position around the container
                    const x = rect.left + Math.random() * rect.width;
                    const y = rect.top + Math.random() * (rect.height / 2);
                    
                    note.style.left = `${x}px`;
                    note.style.top = `${y}px`;
                    
                    // Add to body
                    document.body.appendChild(note);
                    
                    // Remove after animation completes
                    setTimeout(() => {
                        note.remove();
                    }, 4000);
                }
            }, i * 300); // Stagger note creation
        }
    }
    
    /**
     * Test a sound (play briefly)
     */
    function testSound(soundId) {
        try {
            // Stop any currently playing sounds
            stopSound();
            
            // Get audio element
            const audio = document.getElementById(soundId);
            if (!audio) return;
            
            // Add playing class to animate icon
            const soundButtons = document.querySelectorAll('.test-sound-btn');
            soundButtons.forEach(btn => btn.classList.add('playing'));
            
            // Setup audio
            audio.loop = false;
            
            // Try to play with catching errors
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Stop sound after 2 seconds
                    setTimeout(() => {
                        audio.pause();
                        audio.currentTime = 0;
                        
                        // Remove playing class
                        soundButtons.forEach(btn => btn.classList.remove('playing'));
                    }, 2000);
                }).catch(error => {
                    console.error('Error playing test sound:', error);
                    soundButtons.forEach(btn => btn.classList.remove('playing'));
                    
                    // Show user-friendly error
                    showTemporaryNotification('Unable to play sound. Please click anywhere on the page first.', 3000);
                    
                    // Show error in debug container
                    const errorContainer = document.getElementById('audioErrorContainer');
                    if (errorContainer) {
                        errorContainer.innerHTML = `<p>Error playing sound: ${error.message}</p>`;
                    }
                });
            }
        } catch (error) {
            console.error('Error in testSound function:', error);
        }
    }
    
    /**
     * Stop all sounds
     */
    function stopSound() {
        // Get all audio elements
        const audioElements = document.querySelectorAll('audio');
        
        // Pause each one
        audioElements.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        
        // Remove playing class from buttons
        const soundButtons = document.querySelectorAll('.test-sound-btn');
        soundButtons.forEach(btn => btn.classList.remove('playing'));
    }
    
    /**
     * Toggle dark/light theme
     */
    function toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Save theme preference
        localStorage.setItem('funky-theme', newTheme);
        
        // Apply theme
        applyTheme();
    }
    
    /**
     * Apply saved theme
     */
    function applyTheme() {
        const savedTheme = localStorage.getItem('funky-theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('.theme-toggle button i');
        if (themeIcon) {
            if (savedTheme === 'dark') {
                themeIcon.className = 'fas fa-sun';
            } else {
                themeIcon.className = 'fas fa-moon';
            }
        }
    }
    
    /**
     * Setup RGB animation for developer name
     */
    function animateDeveloperName() {
        if (!developerName) return;
        
        // Apply initial animation
        developerName.classList.add('rgb-animation');
        
        // Set interval to refresh animation every 10 seconds
        setInterval(() => {
            developerName.classList.remove('rgb-animation');
            
            // Trigger reflow
            void developerName.offsetWidth;
            
            // Add class again
            developerName.classList.add('rgb-animation');
        }, 10000);
    }
    
    /**
     * Format date time for display
     */
    function formatDateTime(dateTimeString) {
        try {
            const date = new Date(dateTimeString);
            
            // Format date: e.g., "Mar 15, 2023"
            const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
            const formattedDate = date.toLocaleDateString(undefined, dateOptions);
            
            // Format time: e.g., "3:30 PM"
            const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
            const formattedTime = date.toLocaleTimeString(undefined, timeOptions);
            
            return `${formattedDate}, ${formattedTime}`;
        } catch (e) {
            console.error('Error formatting date time:', e);
            return dateTimeString;
        }
    }
    
    /**
     * Show a temporary notification
     */
    function showTemporaryNotification(message, duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'temp-notification';
        notification.textContent = message;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Trigger reflow to ensure transition works
        void notification.offsetWidth;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide and remove after duration
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
    
    /**
     * Setup PWA installation (browser-native only)
     */
    function setupPWAInstall() {
        // Register for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            
            // Stash the event so it can be triggered later by the browser's built-in UI
            deferredPrompt = e;
            
            console.log('App is installable via browser UI');
        });
        
        // Listen for app installed event
        window.addEventListener('appinstalled', (e) => {
            // Show confirmation
            showTemporaryNotification('App installed successfully! 🎉', 3000);
            console.log('App was installed', e);
        });
    }
    
    /**
     * Unlock audio context during initialization to prepare for autoplay
     */
    function unlockAudioContext() {
        // Create audio context if it doesn't exist
        if (!window.audioContext) {
            try {
                window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error('AudioContext not supported:', e);
            }
        }
        
        // Attempt to resume audio context
        if (window.audioContext && window.audioContext.state !== 'running') {
            window.audioContext.resume().catch(e => {
                console.error('Error resuming AudioContext:', e);
            });
        }
        
        // Unlock audio elements
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.load();
            
            // Store the original volume to reset later
            audio.dataset.originalVolume = audio.volume;
            
            // Set volume to 0 to avoid unexpected sounds
            audio.volume = 0;
            
            // Play and immediately pause to unlock
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        // Pause immediately
                        audio.pause();
                        // Reset current time
                        audio.currentTime = 0;
                        // Reset to original volume
                        audio.volume = audio.dataset.originalVolume || 1;
                    })
                    .catch(e => {
                        // This is expected - we're just trying to unlock
                        console.log('Audio unlock attempt acknowledged');
                        // Reset to original volume
                        audio.volume = audio.dataset.originalVolume || 1;
                    });
            }
        });
        
        // Add a one-time event listener to unlock audio on first interaction
        const unlockAudioOnInteraction = () => {
            audioElements.forEach(audio => {
                // Play and immediately pause to unlock on user interaction
                audio.load();
                audio.play()
                    .then(() => {
                        audio.pause();
                        audio.currentTime = 0;
                    })
                    .catch(e => {
                        console.log('Audio unlocked on user interaction');
                    });
            });
            
            // Resume audio context if not running
            if (window.audioContext && window.audioContext.state !== 'running') {
                window.audioContext.resume();
            }
            
            // Remove event listeners after first interaction
            document.removeEventListener('click', unlockAudioOnInteraction);
            document.removeEventListener('touchstart', unlockAudioOnInteraction);
            document.removeEventListener('keydown', unlockAudioOnInteraction);
        };
        
        // Add multiple event listeners to catch any user interaction
        document.addEventListener('click', unlockAudioOnInteraction);
        document.addEventListener('touchstart', unlockAudioOnInteraction);
        document.addEventListener('keydown', unlockAudioOnInteraction);
    }
    
    /**
     * Helper function to force audio playback with multiple techniques
     */
    function forcePlayAudio(audio) {
        if (!audio) return;
        
        // Resume audio context if needed
        if (window.audioContext && window.audioContext.state !== 'running') {
            window.audioContext.resume().catch(e => {
                console.log('Error resuming audio context:', e);
            });
        }
        
        // Ensure volume is set to maximum
        audio.volume = 1.0;
        
        // Try to play with multiple techniques
        try {
            // Method 1: Standard play
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Standard play failed, trying alternative methods:', error);
                    
                    // Method 2: Create and play a clone
                    try {
                        const clone = audio.cloneNode(true);
                        clone.volume = 1.0;
                        document.body.appendChild(clone);
                        clone.play().catch(e => {
                            console.log('Clone play failed:', e);
                        });
                        
                        // Clean up clone after playing
                        clone.onended = function() {
                            if (clone.parentNode) {
                                clone.parentNode.removeChild(clone);
                            }
                        };
                    } catch (e) {
                        console.log('Clone approach failed:', e);
                    }
                });
            }
        } catch (e) {
            console.error('All audio play attempts failed:', e);
        }
    }
}); 