/* ==================== Theme Schedule System ==================== */

(function () {
    'use strict';

    const autoThemeBtn = document.getElementById('autoThemeBtn'); // Kept for reference if needed, but likely replaced
    const autoThemeToggle = document.getElementById('autoThemeToggle'); // New toggle element
    const autoThemeDesc = document.getElementById('autoThemeDesc');
    const scheduleDropdown = document.getElementById('scheduleDropdown');
    const customTimePicker = document.getElementById('customTimePicker');
    const closeTimePicker = document.getElementById('closeTimePicker');
    const cancelTimePicker = document.getElementById('cancelTimePicker');
    const saveTimePicker = document.getElementById('saveTimePicker');
    const scheduleOptions = document.querySelectorAll('.schedule-option');

    let currentScheduleType = localStorage.getItem('scheduleType') || 'custom';
    let customTimes = JSON.parse(localStorage.getItem('customTimes')) || {
        lightStart: '07:00',
        darkStart: '19:00'
    };

    // Wheel picker state
    let lightTimeState = { hour: 7, minute: 0, period: 'AM' };
    let darkTimeState = { hour: 7, minute: 0, period: 'PM' };

    // Initialize wheels
    function initializeWheels() {
        // Parse saved times
        const lightParts = parseTime(customTimes.lightStart);
        const darkParts = parseTime(customTimes.darkStart);

        lightTimeState = lightParts;
        darkTimeState = darkParts;

        // Create wheel content
        createWheel('lightHourWheel', generateHours(), lightTimeState.hour);
        createWheel('lightMinuteWheel', generateMinutes(), lightTimeState.minute);
        createWheel('lightPeriodWheel', ['AM', 'PM'], lightTimeState.period);

        createWheel('darkHourWheel', generateHours(), darkTimeState.hour);
        createWheel('darkMinuteWheel', generateMinutes(), darkTimeState.minute);
        createWheel('darkPeriodWheel', ['AM', 'PM'], darkTimeState.period);
    }

    // Parse time string to components
    function parseTime(timeStr) {
        const [hours, mins] = timeStr.split(':').map(Number);
        let hour = hours % 12 || 12;
        const period = hours >= 12 ? 'PM' : 'AM';
        return { hour, minute: mins, period };
    }

    // Generate hours array (1-12)
    function generateHours() {
        return Array.from({ length: 12 }, (_, i) => i + 1);
    }

    // Generate minutes array (00-59)
    function generateMinutes() {
        return Array.from({ length: 60 }, (_, i) => i);
    }

    // Create a scrolling wheel
    function createWheel(wheelId, items, selectedValue) {
        const wheel = document.getElementById(wheelId);
        if (!wheel) return;

        wheel.innerHTML = '';

        // Padding items removed for single-item view
        // const padding = 2;
        // for (let i = 0; i < padding; i++) { ... }

        // Add actual items
        items.forEach(item => {
            const wheelItem = document.createElement('div');
            wheelItem.className = 'wheel-item';
            wheelItem.textContent = typeof item === 'number' && wheelId.includes('Minute')
                ? String(item).padStart(2, '0')
                : item;
            wheelItem.dataset.value = item;

            if (item === selectedValue) {
                wheelItem.classList.add('selected');
            }

            wheelItem.addEventListener('click', () => {
                scrollToItem(wheel, wheelItem);
            });

            wheel.appendChild(wheelItem);
        });

        // Padding items removed for single-item view
        // for (let i = 0; i < padding; i++) { ... }

        // Scroll to selected item
        setTimeout(() => {
            const selectedItem = wheel.querySelector('.wheel-item.selected');
            if (selectedItem) {
                scrollToItem(wheel, selectedItem);
            }
        }, 100);

        // Add scroll listener for selection highlight
        wheel.addEventListener('scroll', () => handleWheelScroll(wheel), { passive: true });
    }

    // Scroll to specific item
    function scrollToItem(wheel, item) {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Handle wheel scroll to update selection
    function handleWheelScroll(wheel) {
        const items = Array.from(wheel.querySelectorAll('.wheel-item')).filter(item => item.dataset.value);
        const wheelRect = wheel.getBoundingClientRect();
        const centerY = wheelRect.top + wheelRect.height / 2;

        let closestItem = null;
        let closestDistance = Infinity;

        items.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenterY = itemRect.top + itemRect.height / 2;
            const distance = Math.abs(centerY - itemCenterY);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = item;
            }
        });

        // Update selected class
        items.forEach(item => item.classList.remove('selected'));
        if (closestItem) {
            closestItem.classList.add('selected');
            updateTimeState(wheel.id, closestItem.dataset.value);
        }
    }

    // Update time state based on wheel selection
    function updateTimeState(wheelId, value) {
        if (wheelId.includes('light')) {
            if (wheelId.includes('Hour')) lightTimeState.hour = parseInt(value);
            else if (wheelId.includes('Minute')) lightTimeState.minute = parseInt(value);
            else if (wheelId.includes('Period')) lightTimeState.period = value;
        } else if (wheelId.includes('dark')) {
            if (wheelId.includes('Hour')) darkTimeState.hour = parseInt(value);
            else if (wheelId.includes('Minute')) darkTimeState.minute = parseInt(value);
            else if (wheelId.includes('Period')) darkTimeState.period = value;
        }
    }

    // Convert wheel state to 24-hour time string
    function stateToTime(state) {
        let hour = state.hour;
        if (state.period === 'PM' && hour !== 12) hour += 12;
        if (state.period === 'AM' && hour === 12) hour = 0;
        return `${String(hour).padStart(2, '0')}:${String(state.minute).padStart(2, '0')}`;
    }

    // Toggle dropdown when Auto theme button is clicked
    // Toggle dropdown when Auto theme toggle is clicked
    if (autoThemeToggle) {
        autoThemeToggle.addEventListener('click', function (e) {
            e.stopPropagation();

            const currentTheme = localStorage.getItem('theme');

            if (currentTheme !== 'auto') {
                // Switch TO Auto
                if (typeof window.applyTheme === 'function') {
                    window.applyTheme('auto', true);
                } else {
                    localStorage.setItem('theme', 'auto');
                    document.documentElement.setAttribute('data-theme',
                        (new Date().getHours() >= 7 && new Date().getHours() < 19) ? 'light' : 'dark'
                    );
                }

                // Update toggle visual state
                autoThemeToggle.classList.add('active');

                if (currentScheduleType === 'sunrise') {
                    applySunriseSchedule();
                } else if (currentScheduleType === 'custom') {
                    applyCustomSchedule();
                }

                // Open dropdown immediately when switching to auto
                setTimeout(() => {
                    showDropdown();
                }, 50);
            } else {
                // Switch FROM Auto (Turn Off)
                // Default to system or light/dark based on current preference? 
                // Let's default to 'system' as a safe fallback or just toggle off the dropdown if user meant to close it?
                // Actually, a toggle usually means ON/OFF. If it's ON (auto), clicking it should turn it OFF.

                // However, the user might just want to close the dropdown. 
                // But the request said "toggle on and off just like night light".
                // Night light toggle turns the feature off.

                // So, turn off Auto Theme -> Switch to System (or previous).
                if (typeof window.applyTheme === 'function') {
                    window.applyTheme('system', true);
                } else {
                    localStorage.setItem('theme', 'system');
                    // System theme logic would go here, but for now just remove auto
                }

                autoThemeToggle.classList.remove('active');
                hideDropdown();
            }
        });
    }

    // Schedule option selection
    scheduleOptions.forEach(option => {
        option.addEventListener('click', function () {
            const scheduleType = this.dataset.schedule;

            scheduleOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            if (scheduleType === 'custom') {
                showTimePicker();
            } else {
                applySchedule(scheduleType);
                // Don't hide dropdown immediately for better UX in inline mode
                // hideDropdown(); 
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
        saveTimePicker.addEventListener('click', function () {
            const lightStart = stateToTime(lightTimeState);
            const darkStart = stateToTime(darkTimeState);

            customTimes = {
                lightStart: lightStart,
                darkStart: darkStart
            };

            localStorage.setItem('customTimes', JSON.stringify(customTimes));
            applySchedule('custom');
            hideTimePicker();
            // hideDropdown(); // Keep open
        });
    }


    // Close dropdown when clicking outside (not needed with backdrop, but kept for safety)
    // Removed backdrop logic since it's inline now

    // Create backdrop element - REMOVED

    // Add swipe-down gesture to close bottom sheet - REMOVED

    function toggleDropdown() {
        if (scheduleDropdown) {
            const isActive = scheduleDropdown.classList.contains('active');
            if (isActive) {
                hideDropdown();
                if (autoThemeToggle) autoThemeToggle.classList.remove('active');
            } else {
                showDropdown();
                if (autoThemeToggle) autoThemeToggle.classList.add('active');
            }
        }
    }

    function showDropdown() {
        if (scheduleDropdown) {
            scheduleDropdown.classList.add('active');
            updateActiveOption();
            if (autoThemeToggle) autoThemeToggle.classList.add('active');
        }
    }

    function hideDropdown() {
        if (scheduleDropdown) {
            scheduleDropdown.classList.remove('active');
            if (autoThemeToggle) autoThemeToggle.classList.remove('active');
        }
    }

    function showTimePicker() {
        hideDropdown();

        if (customTimePicker) {
            // Overlay removed to prevent blurring/dimming
            // const overlay = document.createElement('div');
            // overlay.className = 'time-picker-overlay';
            // overlay.id = 'timePickerOverlay';
            // overlay.addEventListener('click', hideTimePicker);
            // document.body.appendChild(overlay);

            customTimePicker.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Disable scroll
            initializeWheels(); // Initialize wheels with current values
        }
    }

    function hideTimePicker() {
        if (customTimePicker) {
            customTimePicker.style.display = 'none';
            document.body.style.overflow = ''; // Re-enable scroll
        }
        // Overlay removal logic commented out
        // const overlay = document.getElementById('timePickerOverlay');
        // if (overlay) {
        //     overlay.remove();
        // }

        updateActiveOption();

        if (localStorage.getItem('theme') === 'auto') {
            showDropdown();
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

        if (scheduleType === 'sunrise') {
            await applySunriseSchedule();
        } else if (scheduleType === 'custom') {
            applyCustomSchedule();
        }

        window.dispatchEvent(new CustomEvent('scheduleChanged', {
            detail: { scheduleType: scheduleType }
        }));

        refreshThemeIcon();
    }

    function refreshThemeIcon() {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'auto') {
            window.dispatchEvent(new Event('storage'));

            const themeToggle = document.querySelector('.theme-toggle');
            if (themeToggle) {
                const themeIcon = themeToggle.querySelector('.theme-icon');
                const themeText = themeToggle.querySelector('.theme-text');

                if (themeIcon) {
                    themeIcon.src = 'assets/icons/auto-theme.png';
                    themeIcon.alt = `Auto Theme (${currentScheduleType})`;
                }

                if (themeText) {
                    const scheduleLabels = {
                        'sunrise': 'Sunrise',
                        'custom': 'Custom'
                    };
                    themeText.textContent = scheduleLabels[currentScheduleType] || 'Auto';
                }
            }
        }
    }

    function updateScheduleDescription() {
        if (!autoThemeDesc) return;

        switch (currentScheduleType) {
            case 'sunrise':
                autoThemeDesc.textContent = 'Sunrise to Sunset (auto-location)';
                break;
            case 'custom':
                autoThemeDesc.textContent = `Custom: ${customTimes.lightStart} - ${customTimes.darkStart}`;
                break;
        }
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
            const cached = localStorage.getItem('sunriseTimes');
            if (cached) {
                const data = JSON.parse(cached);
                const cachedDate = new Date(data.date);
                const today = new Date();

                if (cachedDate.toDateString() === today.toDateString()) {
                    const sunrise = new Date(data.sunrise);
                    const sunset = new Date(data.sunset);
                    const now = new Date();

                    const theme = (now >= sunrise && now < sunset) ? 'light' : 'dark';
                    document.documentElement.setAttribute('data-theme', theme);
                    return;
                }
            }

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 10000,
                    maximumAge: 3600000
                });
            });

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`);
            const data = await response.json();

            if (data.status === 'OK') {
                const sunrise = new Date(data.results.sunrise);
                const sunset = new Date(data.results.sunset);
                const now = new Date();

                const theme = (now >= sunrise && now < sunset) ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', theme);

                localStorage.setItem('sunriseTimes', JSON.stringify({
                    sunrise: sunrise.toISOString(),
                    sunset: sunset.toISOString(),
                    date: now.toISOString()
                }));
            }
        } catch (error) {
            console.warn('Geolocation or API error:', error);
        }
    }

    function playConfirmationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.warn('Could not play confirmation sound:', error);
        }
    }

    // Periodic check for auto theme (every minute)
    setInterval(() => {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'auto') {
            if (currentScheduleType === 'sunrise') {
                applySunriseSchedule();
            } else if (currentScheduleType === 'custom') {
                applyCustomSchedule();
            }
        }
    }, 60000);

    // Listen for theme changes to update icon
    window.addEventListener('storage', function (e) {
        if (e.key === 'theme' && e.newValue === 'auto') {
            refreshThemeIcon();
        }
    });

    // Initial icon refresh if in auto mode
    if (localStorage.getItem('theme') === 'auto') {
        setTimeout(refreshThemeIcon, 100);
        if (autoThemeToggle) autoThemeToggle.classList.add('active');
        // We don't auto-show dropdown on load, but we show the toggle as active
    }

    // Initialize after all functions are defined
    if (scheduleOptions && scheduleOptions.length > 0) {
        updateScheduleDescription();
        updateActiveOption();
    }

})();
