/* ==================== Theme Schedule System ==================== */

(function () {
    'use strict';

    const autoThemeBtn = document.getElementById('autoThemeBtn'); // Kept for reference if needed, but likely replaced
    const autoThemeToggle = document.getElementById('autoThemeToggle'); // New toggle element
    const sunriseToggleBtn = document.getElementById('sunriseToggleBtn'); // New circular toggle
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

    // Toggle dropdown when Auto theme toggle is clicked
    if (autoThemeToggle) {
        autoThemeToggle.addEventListener('click', function (e) {
            e.stopPropagation();

            const currentTheme = localStorage.getItem('theme');

            // If theme is already 'auto', clicking the toggle should turn it OFF (switch to system)
            if (currentTheme === 'auto') {
                if (typeof window.applyTheme === 'function') {
                    window.applyTheme('system', true);
                } else {
                    localStorage.setItem('theme', 'system');
                }
                autoThemeToggle.classList.remove('active');
                hideDropdown();
            } else {
                // If theme is NOT 'auto', clicking opens the dropdown (user must select option to enable)
                toggleDropdown();
            }
        });
    }

    // Sunrise Toggle Button Logic
    if (sunriseToggleBtn) {
        sunriseToggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();

            // Toggle logic: If currently sunrise, switch to custom (OFF). If custom, switch to sunrise (ON).
            if (currentScheduleType === 'sunrise') {
                // Turn OFF -> Switch to Custom
                applySchedule('custom');
            } else {
                // Turn ON -> Switch to Sunrise
                applySchedule('sunrise');
            }
        });
    }

    // Schedule option selection (Keep for Custom Time option)
    scheduleOptions.forEach(option => {
        option.addEventListener('click', function () {
            const scheduleType = this.dataset.schedule;

            // If clicking Custom Time row
            if (scheduleType === 'custom') {
                showTimePicker();
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
        });
    }

    function toggleDropdown() {
        if (scheduleDropdown) {
            const isActive = scheduleDropdown.classList.contains('active');
            if (isActive) {
                hideDropdown();
            } else {
                showDropdown();
            }
        }
    }

    function showDropdown() {
        if (scheduleDropdown) {
            scheduleDropdown.classList.add('active');
            updateActiveOption();
            // Only visually activate toggle if theme is actually auto
            if (localStorage.getItem('theme') === 'auto' && autoThemeToggle) {
                autoThemeToggle.classList.add('active');
            }
        }
    }

    function hideDropdown() {
        if (scheduleDropdown) {
            scheduleDropdown.classList.remove('active');
            // Don't remove active class from toggle if theme is auto, just hide dropdown
            // But if we want the toggle to reflect dropdown state?
            // User said "clicking the toggle simply opens the options panel".
            // So the toggle button acts as a dropdown trigger.
            // But it also has a visual "active" state in CSS.
            // Let's keep it simple: Toggle button reflects "Auto Theme Active" state?
            // Or "Dropdown Open" state?
            // Usually a toggle switch reflects the feature state (Auto Theme).
            // So we should NOT toggle the .active class on show/hide dropdown unless the theme changes.

            // However, the previous code synced them.
            // Let's rely on refreshThemeIcon or similar to update the toggle state?
            // Or just leave it alone here.
        }
    }

    function showTimePicker() {
        hideDropdown();

        if (customTimePicker) {
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
        updateActiveOption();

        if (localStorage.getItem('theme') === 'auto') {
            showDropdown();
        }
    }

    function updateActiveOption() {
        // Update Custom Time option highlight
        scheduleOptions.forEach(option => {
            if (option.dataset.schedule === currentScheduleType) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // Update Sunrise Toggle Button
        if (sunriseToggleBtn) {
            if (currentScheduleType === 'sunrise') {
                sunriseToggleBtn.textContent = 'ON';
                sunriseToggleBtn.classList.add('active');
            } else {
                sunriseToggleBtn.textContent = 'OFF';
                sunriseToggleBtn.classList.remove('active');
            }
        }
    }

    async function applySchedule(scheduleType) {
        currentScheduleType = scheduleType;
        localStorage.setItem('scheduleType', scheduleType);

        // Enforce Auto Theme when a schedule is applied
        if (localStorage.getItem('theme') !== 'auto') {
            if (typeof window.applyTheme === 'function') {
                window.applyTheme('auto', true);
            } else {
                localStorage.setItem('theme', 'auto');
            }
            if (autoThemeToggle) autoThemeToggle.classList.add('active');
        }

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
                    themeIcon.src = 'assets/icons/custom-theme.png';
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
        updateActiveOption(); // This will set the button text based on currentScheduleType
    }

})();

