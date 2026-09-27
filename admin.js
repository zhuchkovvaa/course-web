// js/admin.js - Логика для admin.html И index.html

/* =========================================
   ФУНКЦИИ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ (index.html)
   ========================================= */

// Проверка авторизации и обновление меню (с поддержкой перевода)
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const authLink = document.getElementById('nav-auth-link');
    const profileLink = document.getElementById('nav-profile-link');
    const adminLink = document.getElementById('nav-admin-link');
    const logoutLink = document.getElementById('nav-logout-link');
    
    // Узнаем текущий язык, чтобы сразу написать правильный текст
    const lang = localStorage.getItem('language') || 'ru';
    const t = window.translations ? window.translations[lang] : {};

    if (!user) {
        // 1. Если никто не вошел: показываем только "Войти"
        if(authLink) {
            authLink.style.display = 'block';
            // Сразу ставим переведенный текст
            const link = authLink.querySelector('a');
            if(link) link.textContent = t['btn-auth'] || 'Войти'; 
        }
        if(profileLink) profileLink.style.display = 'none';
        if(adminLink) adminLink.style.display = 'none';
        if(logoutLink) logoutLink.style.display = 'none';
        return;
    }

    // 2. Если кто-то вошел: скрываем "Войти"
    if(authLink) authLink.style.display = 'none';
    
    // Показываем "Личный кабинет" или "Админку" с правильным текстом
    if (user.role === 'admin') {
        // АДМИН: видит Админку, НЕ видит Личный кабинет
        if(adminLink) {
            adminLink.style.display = 'block';
            const link = adminLink.querySelector('a');
            if(link) link.textContent = t['btn-admin'] || 'Админ-панель';
        }
        if(profileLink) profileLink.style.display = 'none';
    } else {
        // ПОЛЬЗОВАТЕЛЬ: видит Личный кабинет, НЕ видит Админку
        if(profileLink) {
            profileLink.style.display = 'block';
            const link = profileLink.querySelector('a');
            if(link) link.textContent = t['btn-profile'] || 'Личный кабинет';
        }
        if(adminLink) adminLink.style.display = 'none';
    }

    // Показываем "Выйти" с правильным текстом
    if(logoutLink) {
        logoutLink.style.display = 'block';
        const link = logoutLink.querySelector('a');
        if(link) link.textContent = t['btn-logout'] || 'Выйти';
    }
}

// Открыть личный кабинет
function openProfile() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    const infoDiv = document.getElementById('profile-info');
    if (infoDiv) {
        infoDiv.innerHTML = `
            <p><strong>Никнейм:</strong> ${user.nickname}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Имя:</strong> ${user.fullname}</p>
            <p><strong>Роль:</strong> ${user.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
        `;
    }
    
    const modal = document.getElementById('profile-modal');
    if (modal) modal.style.display = 'flex';
}

function closeProfile() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.style.display = 'none';
}

// Загрузка корзины для текущего пользователя (вызывается при смене аккаунта)
function loadCartForUser() {
    // Эта функция определена в homepage.js как window.loadCartForUserGlobal
    if (typeof window.loadCartForUserGlobal === 'function') {
        window.loadCartForUserGlobal();
    }
}

// Выход из системы
function logout() {
    localStorage.removeItem('currentUser');
    // Очищаем переменную корзины перед перезагрузкой
    if (typeof cart !== 'undefined') cart = []; 
    window.location.reload(); 
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Если мы на главной странице (есть nav-auth-link), запускаем проверку
    if (document.getElementById('nav-auth-link')) {
        checkAuth();
    }
});

/* =========================================
   ФУНКЦИИ ДЛЯ АДМИНКИ (admin.html)
   ========================================= */

// Словарь для перевода ключей категорий в красивые названия
const categoryNames = {
    'legal': 'Юридические услуги',
    'tech': 'IT-услуги',
    'creative': 'Дизайн',
    'marketing': 'Маркетинг',
    'hr': 'HR',
    'ecommerce': 'E-commerce'
};

// Загрузить список ТОВАРОВ с группировкой по категориям
async function loadAdminServices() {
    const container = document.getElementById('admin-services-list');
    if (!container) return;
    
    try {
        const res = await fetch('http://localhost:3000/products'); 
        if (!res.ok) throw new Error('Ошибка сервера');
        const products = await res.json();
        
        if (products.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px;">Нет добавленных услуг</p>';
            return;
        }

        // Группируем товары по категориям
        const grouped = {};
        products.forEach(p => {
            if (!grouped[p.category]) grouped[p.category] = [];
            grouped[p.category].push(p);
        });

        let html = '';
        
        // Проходим по каждой группе и рисуем заголовок + таблицу
        for (const [catKey, items] of Object.entries(grouped)) {
            const catTitle = categoryNames[catKey] || catKey;
            
            html += `<div class="category-group">`;
            html += `<h2 class="category-header">${catTitle}</h2>`;
            
            html += `<div class="services-wrapper"><table class="admin-table" style="margin:0; border:none;"><thead><tr style="background:#f9f9f9;">
                <th style="padding:12px; text-align:left;">Название</th>
                <th style="padding:12px; text-align:left;">Цена</th>
                <th style="padding:12px; text-align:left;">Срок</th>
                <th style="padding:12px; text-align:right;">Действия</th>
            </tr></thead><tbody>`;
            
            items.forEach(p => {
                html += `<tr style="border-bottom: 1px solid #eee;">
                    <td style="padding:12px;"><strong>${p.title}</strong><br><small style="color:#666">${p.description ? p.description.substring(0, 60) + '...' : ''}</small></td>
                    <td style="padding:12px;">${p.price} ₽</td>
                    <td style="padding:12px;">${p.time || '-'}</td>
                    <td style="padding:12px; text-align:right;">
                        <button onclick="deleteService('${p.id}')" class="btn-danger">Удалить</button>
                    </td>
                </tr>`;
            });
            
            html += `</tbody></table></div></div>`;
        }

        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = '<p style="color:red; text-align:center;">Ошибка загрузки. Проверьте консоль.</p>';
        console.error(err);
    }
}

// Добавить новый товар
async function addService() {
    const title = document.getElementById('admin-serv-title').value.trim();
    const price = document.getElementById('admin-serv-price').value.trim();
    const category = document.getElementById('admin-serv-category').value;
    const image = document.getElementById('admin-serv-image').value.trim() || 'https://placehold.co/120x120/cccccc/ffffff?text=New';
    const desc = document.getElementById('admin-serv-desc').value.trim();
    const time = document.getElementById('admin-serv-time').value.trim() || 'от 2 дней';

    if (!title || !price) {
        alert('Заполните название и цену!');
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title, 
                price: parseInt(price),
                category,
                image,
                description: desc,
                time
            })
        });
        
        if (res.ok) {
            alert('Товар успешно добавлен!');
            // Очистка формы
            document.getElementById('admin-serv-title').value = '';
            document.getElementById('admin-serv-price').value = '';
            document.getElementById('admin-serv-desc').value = '';
            document.getElementById('admin-serv-image').value = '';
            document.getElementById('admin-serv-time').value = '';
            loadAdminServices(); // Перезагрузка списка
        } else {
            alert('Ошибка при сохранении');
        }
    } catch (err) {
        alert('Не удалось подключиться к серверу');
        console.error(err);
    }
}

// Удалить товар
async function deleteService(id) {
    if (!confirm('Вы точно хотите удалить этот товар? Это действие нельзя отменить.')) return;
    
    try {
        const res = await fetch(`http://localhost:3000/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadAdminServices();
        } else {
            alert('Ошибка при удалении');
        }
    } catch (err) {
        alert('Ошибка сети');
        console.error(err);
    }
}