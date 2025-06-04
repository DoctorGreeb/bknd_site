function showUsername() {
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            const userDisplay = document.getElementById('user-display');
            const logoutBtn = document.getElementById('logout-btn');
            if (data.username) {
                userDisplay.textContent = `Привет, ${data.username}!`;
                logoutBtn.style.display = 'inline';
            } else {
                userDisplay.textContent = '';
                logoutBtn.style.display = 'none';
            }
        })
        .catch(() => {
            document.getElementById('user-display').textContent = '';
            document.getElementById('logout-btn').style.display = 'none';
        });
}

function logout() {
    fetch('/api/logout', { method: 'POST' })
        .then(response => response.json())
        .then(() => {
            showUsername();
            window.location.href = '/form.html'; // Перенаправление на страницу входа
        });
}

document.addEventListener('DOMContentLoaded', function() {
    showUsername();
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', logout);
});