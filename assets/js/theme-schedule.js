/* ==================== Theme Schedule System ==================== */

(function() {
    'use strict';

    const autoThemeBtn = document.getElementById('autoThemeBtn');
    const autoThemeDesc = document.getElementById('autoThemeDesc');
    const scheduleDropdown = document.getElementById('scheduleDropdown');
    const customTimePicker = document.getElementById('customTimePicker');
    const closeTimePicker = document.getElementById('closeTimePicker');
    const cancelTimePicker = document.getElementById('cancelTimePicker');
    const saveTimePicker = document.getElementById('saveTimePicker');
    const lightModeStart = document.getElementById('lightModeStart');
    const darkModeStart = document.getElementById('darkModeStart');

    let currentScheduleType = localStorage.getItem('scheduleType') || 'fixed';
    let customTimes = JSON.parse(localStorage.getItem('customTimes')) || {
        lightStart: '07:00',
        darkStart: '19:00'
    };

    // Initialize
    updateScheduleDescription();
    loadSavedTimes();

    // Toggle dropdown when Auto theme button is clicked
    if (autoThemeBtn) {
        autoThemeBtn.addEventListener('click', function(e) {
            // If clicking to select auto theme (not already selected)
            const isActive = this.classList.contains('active');
            
            if (isActive) {
                // Already selected, toggle dropdown
                toggleDropdown();
            } else {
                // Not selected, select it first
                this.click(); // This will trigger the theme selection
                // Show dropdown after a brief delay
                setTimeout(() => {
                    if (scheduleDropdown) {
                        scheduleDropdown.style.display = 'block';
                    }
                }, 100);
            }
        });
    }

    // Schedule option selection
    const scheduleOptions = document.querySelectorAll('.schedule-option');
    scheduleOptions.forEach(option => {
        option.addEventListener('click', function() {
            const scheduleType = this.dataset.schedule;
            
            // Remove active class from all options
            scheduleOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to selected option
            this.classList.add('active');
            
            if (scheduleType === 'custom') {
                // Show custom time picker
                showTimePicker();
            } else {
                // Apply schedule immediately
                applySchedule(scheduleType);
                hideDropdown();
            }
        });
    });

    // Close time picker
    if (closeTimePicker) {
        closeTimePicker.addEventListener('click', hideTimePicker);
    }
    if (cancelTimePicker) {
        cancelTimePicker.addEventListener('click', hideTimePicker);
    }

    // Save custom time
    if (saveTimePicker) {
        saveTimePicker.addEventListener('click', function() {
            const lightStart = lightModeStart.value;
            const darkStart = darkModeStart.value;
            
            customTimes = {
                lightStart: lightStart,
                darkStart: darkStart
            };
            
            localStorage.setItem('customTimes', JSON.stringify(customTimes));
            applySchedule('custom');
            hideTimePicker();
            hideDropdown();
        });
    }

    function toggleDropdown() {
        if (scheduleDropdown) {
            const isVisible = scheduleDropdown.style.display === 'block';
            scheduleDropdown.style.display = isVisible ? 'none' : 'block';
            
            // Update active state on options
            updateActiveOption();
        }
    }

    function hideDropdown() {
        if (scheduleDropdown) {
            scheduleDropdown.style.display = 'none';
        }
    }

    function showTimePicker() {
        if (customTimePicker) {
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'time-picker-overlay';
            overlay.id = 'timePickerOverlay';
            overlay.addEventListener('click', hideTimePicker);
            document.body.appendChild(overlay);
            
            customTimePicker.style.display = 'block';
        }
    }

    function hideTimePicker() {
        if (customTimePicker) {
            customTimePicker.style.display = 'none';
        }
        const overlay = document.getElementById('timePickerOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    function loadSavedTimes() {
        if (lightModeStart && darkModeStart) {
            lightModeStart.value = customTimes.lightStart;
            darkModeStart.value = customTimes.darkStart;
        }
    }

    function updateActiveOption() {
        scheduleOptions.forEach(option => {
            if (option.dataset.schedule === currentScheduleType) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    async function applySchedule(scheduleType) {
        currentScheduleType = scheduleType;
        localStorage.setItem('scheduleType', scheduleType);
        
        updateScheduleDescription();
        playConfirmationSound();
        
        // Apply the theme based on schedule
        if (scheduleType === 'sunrise') {
            await applySunriseSchedule();
        } else if (scheduleType === 'custom') {
            applyCustomSchedule();
        } else {
            applyFixedSchedule();
        }
    }

    function updateScheduleDescription() {
        if (!autoThemeDesc) return;
        
        switch (currentScheduleType) {
            case 'fixed':
                autoThemeDesc.textContent = 'Switch based on time (7 AM - 7 PM)';
                break;
            case 'sunrise':
                autoThemeDesc.textContent = 'Sunrise to Sunset (auto-location)';
                break;
            case 'custom':
                autoThemeDesc.textContent = `Custom: ${customTimes.lightStart} - ${customTimes.darkStart}`;
                break;
        }
    }

    function applyFixedSchedule() {
        const hour = new Date().getHours();
        const theme = (hour >= 7 && hour < 19) ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
    }

    function applyCustomSchedule() {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const lightStart = customTimes.lightStart;
        const darkStart = customTimes.darkStart;
        
        let theme = 'dark';
        if (currentTime >= lightStart && currentTime < darkStart) {
            theme = 'light';
        }
        
        document.documentElement.setAttribute('data-theme', theme);
    }

    async function applySunriseSchedule() {
        try {
            // Get user's location
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Fetch sunrise/sunset times from API
            const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`);
            const data = await response.json();
            
            if (data.status === 'OK') {
                const sunrise = new Date(data.results.sunrise);
                const sunset = new Date(data.results.sunset);
                const now = new Date();
                
                // Determine theme based on current time
                const theme = (now >= sunrise && now < sunset) ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', theme);
                
                // Store times for reference
                localStorage.setItem('sunriseTimes', JSON.stringify({
                    sunrise: sunrise.toISOString(),
                    sunset: sunset.toISOString(),
                    date: now.toDateString()
                }));
            } else {
                // Fallback to fixed schedule
                console.warn('Sunrise API failed, using fixed schedule');
                applyFixedSchedule();
            }
        } catch (error) {
            console.warn('Geolocation or API error, using fixed schedule:', error);
            applyFixedSchedule();
        }
    }

    function playConfirmationSound() {
        // Create a simple confirmation beep using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure the sound
        oscillator.frequency.value = 800; // Frequency in Hz
        oscillator.type = 'sine'; // Sine wave for smooth sound
        
        // Volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        // Play the sound
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    // Periodic check for auto theme (every minute)
    setInterval(() => {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'auto') {
            if (currentScheduleType === 'sunrise') {
                applySunriseSchedule();
            } else if (currentScheduleType === 'custom') {
                applyCustomSchedule();
            } else {
                applyFixedSchedule();
            }
        }
    }, 60000); // Check every minute

})();
