// app.js: логика загрузки страниц и переключения вкладок

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar подгружаем в main.html
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        fetch('sidebar.html')
            .then(res => res.text())
            .then(html => {
                sidebarContainer.innerHTML = html;
                setupSidebarLinks();
            });
    }
    // По умолчанию загружаем первую вкладку
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        loadPage('pages/obuchenie.html');
    }

    function setupSidebarLinks() {
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.sidebar-menu a').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                const page = this.getAttribute('data-page');
                if (page) loadPage('pages/' + page);
                if (this.classList.contains('sidebar-exit')) {
                    window.location.href = 'login.html';
                }
            });
        });
    }

    function loadPage(url) {
        fetch(url)
            .then(res => res.text())
            .then(html => {
                mainContent.innerHTML = html;
            });
    }
});
