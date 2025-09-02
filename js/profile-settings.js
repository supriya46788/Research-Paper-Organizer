// Profile & Settings Page JS


document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
            document.getElementById('email').value = data.email || '';
            document.getElementById('username').value = data.username || '';
            document.getElementById('theme').value = data.preferences?.theme || 'light';
            document.getElementById('emailNotifications').checked = data.notifications?.email || false;
            document.getElementById('pushNotifications').checked = data.notifications?.push || false;
            setTheme(data.preferences?.theme || 'light');
        });

    document.getElementById('theme').addEventListener('change', (e) => {
        setTheme(e.target.value);
    });

    document.getElementById('updateAccountBtn').onclick = () => {
        const username = document.getElementById('username').value;
        fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        })
        .then(res => res.json())
        .then(data => showMessage(data.message || 'Account updated!'));
    };

    document.getElementById('updatePreferencesBtn').onclick = () => {
        const theme = document.getElementById('theme').value;
        fetch('/api/user/preferences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme })
        })
        .then(res => res.json())
        .then(data => {
            setTheme(theme);
            showMessage(data.message || 'Preferences saved!');
        });
    };

    document.getElementById('updateNotificationsBtn').onclick = () => {
        const email = document.getElementById('emailNotifications').checked;
        const push = document.getElementById('pushNotifications').checked;
        fetch('/api/user/notifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, push })
        })
        .then(res => res.json())
        .then(data => showMessage(data.message || 'Notifications updated!'));
    };

    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.remove('theme-dark');
        }
    }

    function showMessage(msg) {
        document.getElementById('profileMessage').textContent = msg;
        setTimeout(() => {
            document.getElementById('profileMessage').textContent = '';
        }, 3000);
    }
});
