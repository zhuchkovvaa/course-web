// js/homepage.js

// Глобальные переменные для корзины и текущего пользователя
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
// Ключ корзины теперь зависит от никнейма: cart_SuperUser123 или cart_guest
let cartKey = currentUser ? `cart_${currentUser.nickname}` : 'cart_guest'; 
let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

document.addEventListener('DOMContentLoaded', async () => {
    // --- ПРОВЕРКА АВТОРИЗАЦИИ (для обновления хедера) ---
    if (typeof checkAuth === 'function') checkAuth();

    // --- ИНИЦИАЛИЗАЦИЯ ЯЗЫКА И ТЕМЫ ---
    const savedLang = localStorage.getItem('language') || 'ru';
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;

    if (savedTheme === 'dark') body.setAttribute('data-theme', 'dark');
    
    // Сначала применяем язык
    if (typeof applyLanguage === 'function') applyLanguage(savedLang);

    // --- ЭЛЕМЕНТЫ УПРАВЛЕНИЯ ---
    const themeToggle = document.getElementById('theme-toggle');
    const visionToggle = document.getElementById('vision-toggle');
    const visionPanel = document.getElementById('vision-panel');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const servicesContainer = document.getElementById('services-container');

    if (themeToggle) themeToggle.textContent = 'Т';
    if (visionToggle) visionToggle.textContent = 'А+';

    // --- ЛОГИКА СМЕНЫ ЯЗЫКА ---
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle && typeof applyLanguage === 'function') {
        langToggle.addEventListener('click', () => {
            const currentLang = localStorage.getItem('language') || 'ru';
            applyLanguage(currentLang === 'ru' ? 'en' : 'ru');
            if (typeof allServices !== 'undefined' && allServices.length > 0 && typeof renderServices === 'function') {
                renderServices(allServices);
            }
        });
    }

    // --- ЛОГИКА ТЕМЫ ---
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = body.getAttribute('data-theme') === 'dark';
            if (isDark) {
                body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            } else {
                body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // ==========================================
    // АДАПТИВНАЯ ЛОГИКА ВЕРСИИ ДЛЯ СЛАБОВИДЯЩИХ (С !IMPORTANT)
    // ==========================================
    
    function applyVisionSettings() {
        const isActive = body.classList.contains('vision-mode');
        if (!isActive) return; 

        const fontSizeSelect = document.getElementById('vision-font-size');
        let scale = 1;

        if (fontSizeSelect) {
            const val = fontSizeSelect.value;
            if (val === '150%') scale = 1.5;
            else if (val === '200%') scale = 2.0;
            else scale = 1;
        }

        // НАДЕЖНАЯ ПРОВЕРКА: ЕСТЬ ЛИ НА СТРАНИЦЕ СПИСОК УСЛУГ?
        const hasServiceListItems = document.querySelectorAll('.service-list-item').length > 0;
        const isHomePage = !hasServiceListItems;

        // РАЗМЕРЫ ДЛЯ ГЛАВНОЙ (УМЕНЬШЕНЫ)
        const baseH1 = isHomePage ? 28 : 36;      
        const baseH2 = isHomePage ? 20 : 28;
        const baseH3 = isHomePage ? 16 : 20;
        const baseText = isHomePage ? 14 : 16;
        const baseNav = isHomePage ? 13 : 14;
        const baseBtn = isHomePage ? 13 : 14;
        const baseFooter = isHomePage ? 12 : 13; // Базовый размер для футера

        // ПРИМЕНЯЕМ РАЗМЕРЫ С !IMPORTANT
        document.querySelectorAll('h1').forEach(el => {
            el.style.setProperty('font-size', `${baseH1 * scale}px`, 'important');
            el.style.setProperty('line-height', '1.2', 'important');
        });
        
        document.querySelectorAll('h2').forEach(el => {
            el.style.setProperty('font-size', `${baseH2 * scale}px`, 'important');
            el.style.setProperty('line-height', '1.3', 'important');
        });
        
        document.querySelectorAll('h3').forEach(el => {
            el.style.setProperty('font-size', `${baseH3 * scale}px`, 'important');
            el.style.setProperty('line-height', '1.3', 'important');
        });
        
        document.querySelectorAll('p, li, span:not(.price):not(.time)').forEach(el => {
            if (!el.closest('button') && !el.closest('input') && !el.closest('select')) {
                el.style.setProperty('font-size', `${baseText * scale}px`, 'important');
                el.style.setProperty('line-height', '1.5', 'important');
            }
        });
        
        document.querySelectorAll('nav a, .logo, .btn-nav-auth').forEach(el => {
            el.style.setProperty('font-size', `${baseNav * scale}px`, 'important');
        });

        // НОВОЕ: Принудительное увеличение ФУТЕРА (синхронно с хедером)
        document.querySelectorAll('footer, .footer-col, .footer-links a, .footer-logo, .footer-col h5').forEach(el => {
            el.style.setProperty('font-size', `${baseFooter * scale}px`, 'important');
        });
        
        document.querySelectorAll('button:not(.icon-btn), input:not([type="checkbox"]), select, textarea, label, a.btn-primary, a.btn-outline, .btn-add, .btn-sub').forEach(el => {
            el.style.setProperty('font-size', `${baseBtn * scale}px`, 'important');
            const padV = isHomePage ? 8 : 10;
            const padH = isHomePage ? 12 : 16;
            el.style.setProperty('padding', `${padV * scale}px ${padH * scale}px`, 'important');
            el.style.setProperty('font-weight', 'bold', 'important');
            el.style.setProperty('text-decoration', 'underline', 'important');
        });

        // Цветовые схемы
        const colorSchemeSelect = document.getElementById('vision-color-scheme');
        const scheme = colorSchemeSelect ? colorSchemeSelect.value : 'white-black';
        body.setAttribute('data-vision-scheme', scheme);

        // Картинки
        const hideImagesCheckbox = document.getElementById('vision-hide-images');
        if (hideImagesCheckbox && hideImagesCheckbox.checked) {
            body.classList.add('no-images');
        } else {
            body.classList.remove('no-images');
        }
    }

    function toggleVisionMode(enable) {
        if (enable) {
            body.classList.add('vision-mode');
            if (visionPanel) visionPanel.classList.add('active');
            applyVisionSettings();
        } else {
            body.classList.remove('vision-mode', 'no-images');
            body.removeAttribute('data-vision-scheme');
            
            // СБРОС ВСЕХ INLINE-СТИЛЕЙ
            document.querySelectorAll('h1, h2, h3, p, li, span, nav a, .logo, .btn-nav-auth, button, input, select, textarea, label, a, footer, .footer-col, .footer-links a, .footer-logo, .footer-col h5').forEach(el => {
                el.style.fontSize = '';
                el.style.lineHeight = '';
                el.style.padding = '';
                el.style.fontWeight = '';
                el.style.textDecoration = '';
            });
            
            if (visionPanel) visionPanel.classList.remove('active');
            
            const fs = document.getElementById('vision-font-size');
            const cs = document.getElementById('vision-color-scheme');
            const hi = document.getElementById('vision-hide-images');
            
            if (fs) fs.value = '100%';
            if (cs) cs.value = 'white-black';
            if (hi) hi.checked = false;
        }
        localStorage.setItem('visionMode', enable ? 'true' : 'false');
    }

    // Загрузка состояния при старте
    setTimeout(() => {
        if (localStorage.getItem('visionMode') === 'true') {
            toggleVisionMode(true);
        }
    }, 100);

    // Обработчик кнопки А+ (ОБНОВЛЕННЫЙ)
    if (visionToggle) {
        visionToggle.addEventListener('click', () => {
            const isActive = body.classList.contains('vision-mode');
            if (!isActive) {
                toggleVisionMode(true);
            } else {
                if (visionPanel) {
                    visionPanel.classList.toggle('active');
                }
            }
        });
    }

    // ДЕЛЕГИРОВАНИЕ СОБЫТИЙ
    document.addEventListener('change', (e) => {
        if (e.target.id === 'vision-font-size' || 
            e.target.id === 'vision-color-scheme' || 
            e.target.id === 'vision-hide-images') {
            applyVisionSettings();
        }
    });

    // Слушаем клики для кнопки сброса
    document.addEventListener('click', (e) => {
        if (e.target.id === 'reset-vision') {
            toggleVisionMode(false);
        }
    });

    // Закрытие панели крестиком БЕЗ сброса настроек
    const closeVisionBtn = document.getElementById('close-vision-panel');
    if (closeVisionBtn) {
        closeVisionBtn.addEventListener('click', () => {
            if (visionPanel) {
                visionPanel.classList.remove('active');
            }
        });
    }
    // ==========================================


    // --- ЗАГРУЗКА И РЕНДЕРИНГ УСЛУГ ---
    let allServices = [];
    if (servicesContainer) {
        try {
            const res = await fetch('http://localhost:3000/services');
            if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
            allServices = await res.json();
            
            function renderFilteredServices(servicesToRender) {
                if (typeof renderServices === 'function') renderServices(servicesToRender);
            }

            renderFilteredServices(allServices);

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase();
                    const lang = localStorage.getItem('language') || 'ru';
                    const filtered = allServices.filter(service => {
                        const title = lang === 'en' ? (service.title_en || service.title) : service.title;
                        const desc = lang === 'en' ? (service.description_en || service.description) : service.description;
                        return title.toLowerCase().includes(query) || desc.toLowerCase().includes(query);
                    });
                    renderFilteredServices(filtered);
                });
            }

            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    const sortType = e.target.value;
                    const lang = localStorage.getItem('language') || 'ru';
                    let sorted = [...allServices];
                    
                    if (sortType === 'az') {
                        sorted.sort((a, b) => {
                            const tA = lang === 'en' ? (a.title_en || a.title) : a.title;
                            const tB = lang === 'en' ? (b.title_en || b.title) : b.title;
                            return tA.localeCompare(tB);
                        });
                    } else if (sortType === 'za') {
                        sorted.sort((a, b) => {
                            const tA = lang === 'en' ? (a.title_en || a.title) : a.title;
                            const tB = lang === 'en' ? (b.title_en || b.title) : b.title;
                            return tB.localeCompare(tA);
                        });
                    }
                    renderFilteredServices(sorted);
                });
            }
        } catch (error) {
            console.error('Не удалось загрузить услуги:', error);
            servicesContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red;">Ошибка загрузки данных.<br><small>${error.message}</small></p>`;
        }
    }

    // --- УНИВЕРСАЛЬНЫЙ ПОИСК ---
    if (searchInput) {
        function filterAndSort() {
            const query = searchInput.value.toLowerCase();
            const items = document.querySelectorAll('.service-list-item');
            items.forEach(item => {
                const titleEl = item.querySelector('h3');
                const title = titleEl ? titleEl.textContent.toLowerCase() : '';
                let descText = '';
                item.querySelectorAll('p').forEach(p => {
                    if (!p.closest('.service-meta')) descText += p.textContent.toLowerCase() + ' ';
                });
                item.style.display = (title.includes(query) || descText.includes(query)) ? 'flex' : 'none';
            });
        }
        searchInput.addEventListener('input', filterAndSort);
        if (sortSelect) sortSelect.addEventListener('change', filterAndSort);
    }

    // --- КОРЗИНА ---
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-add');
        if (btn) {
            const card = btn.closest('.service-list-item');
            if (!card) return;
            const title = card.querySelector('h3')?.textContent || 'Услуга';
            const priceText = card.querySelector('.price')?.textContent || '0₽';
            const imageSrc = card.querySelector('.service-image img')?.src || '';
            const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
            const id = card.dataset.id || title.toLowerCase().replace(/\s+/g, '-');
            addToCart({ id, title, price, image: imageSrc });
        }
    });
    renderCart();

    // --- МОДАЛКИ ---
    
    const detailModal = document.getElementById('detail-modal');
    const closeDetailBtn = document.getElementById('close-modal');
    
    if (detailModal && servicesContainer) {
        servicesContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-outline')) {
                const card = e.target.closest('.card');
                if (card) {
                    const titleEl = card.querySelector('h3');
                    const descEl = card.querySelector('p');
                    if (titleEl && descEl) {
                        document.getElementById('modal-title').textContent = titleEl.textContent;
                        document.getElementById('modal-desc').textContent = descEl.textContent;
                        window.currentServiceForModal = {
                            id: card.dataset.id || titleEl.textContent.toLowerCase().replace(/\s+/g, '-'),
                            title: titleEl.textContent,
                            description: descEl.textContent,
                            price: parseFloat(card.dataset.price) || 0,
                            image: card.querySelector('img')?.src || ''
                        };
                        detailModal.style.display = 'flex';
                    }
                }
            }
        });

        const orderBtnInModal = detailModal.querySelector('.btn-primary');
        if (orderBtnInModal) {
            orderBtnInModal.addEventListener('click', () => {
                if (window.currentServiceForModal) {
                    addToCart(window.currentServiceForModal);
                    detailModal.style.display = 'none';
                }
            });
        }
    }

    if (closeDetailBtn && detailModal) {
        closeDetailBtn.addEventListener('click', () => detailModal.style.display = 'none');
        detailModal.addEventListener('click', (e) => { if (e.target === detailModal) detailModal.style.display = 'none'; });
    }

    // FAQ
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                document.querySelectorAll('.faq-item').forEach(i => { if (i !== item) i.classList.remove('active'); });
                item.classList.toggle('active');
            });
        }
    });

        // === УНИВЕРСАЛЬНАЯ НАВИГАЦИЯ (СКРОЛЛ + МОДАЛКА) ===
    document.addEventListener('click', (e) => {
        // Ищем ближайшую ссылку (на случай если кликнули на иконку внутри ссылки)
        const anchor = e.target.closest('a[href^="#"]');
        
        if (!anchor) return; // Если клик не по ссылке с #, выходим

        const href = anchor.getAttribute('href');

        // 1. ЛОГИКА ДЛЯ КОНТАКТОВ (Открываем модалку)
        if (href === '#contacts' || anchor.classList.contains('open-contacts-link')) {
            e.preventDefault(); // Запрещаем переход
            
            // Пробуем открыть через функцию, если она есть
            if (typeof window.openContactsModal === 'function') {
                window.openContactsModal(e);
            } else {
                // Или напрямую меняем стиль
                const modal = document.getElementById('contacts-modal');
                if (modal) modal.style.display = 'flex';
            }
            return; // Заканчиваем выполнение
        }

        // 2. ЛОГИКА ДЛЯ ОБЫЧНЫХ ЯКОРЕЙ (Плавный скролл)
        // Работает для #faq, #guarantees и т.д.
        if (href && href !== '#') {
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                e.preventDefault(); // Запрещаем резкий прыжок
                window.scrollTo({ 
                    top: targetElement.offsetTop - 80, // Отступ сверху для хедера
                    behavior: 'smooth' 
                });
            }
        }
    });

    // Закрытие по клику на фон для ВСЕХ модалок
    ['contacts-modal', 'success-modal', 'checkout-modal', 'subscription-modal', 'success-subscription-modal', 'plan-details-modal'].forEach(id => {
        const m = document.getElementById(id);
        if (m) {
            m.addEventListener('click', (e) => { 
                if (e.target === m) m.style.display = 'none';
            });
        }
    });

    // Формы
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            document.getElementById('checkout-modal').style.display = 'none';
            document.getElementById('success-modal').style.display = 'flex';
            cart = []; saveCart(); orderForm.reset();
        });
    }

    const subForm = document.getElementById('subscription-form');
    if (subForm) {
        subForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            document.getElementById('subscription-modal').style.display = 'none';
            document.getElementById('success-subscription-modal').style.display = 'flex';
            subForm.reset();
            const label = document.getElementById('select-label');
            const lang = localStorage.getItem('language') || 'ru';
            if (label && typeof translations !== 'undefined') label.innerText = translations[lang]['select-method'];
        });
    }
});

/* =========================================
   TOASTS
   ========================================= */
function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.style.cssText = `background-color: #32c94f; color: white; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: var(--font-family, sans-serif); font-size: 14px; font-weight: 500; opacity: 0; transform: translateY(20px); transition: all 0.3s ease; max-width: 300px;`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; });
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; setTimeout(() => toast.remove(), 300); }, 3000);
}

/* =========================================
   КОРЗИНА (ИСПРАВЛЕННАЯ - ИНДИВИДУАЛЬНАЯ)
   ========================================= */

// Сохранение в уникальную ячейку для текущего пользователя
function saveCart() { 
    localStorage.setItem(cartKey, JSON.stringify(cart)); 
    renderCart(); 
}

// !!! ИЗМЕНЕНО: Добавлена проверка авторизации !!!
function addToCart(service) {
    // Проверка: вошел ли пользователь?
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert('Для добавления в корзину необходимо войти в аккаунт!');
        window.location.href = 'login.html';
        return;
    }

    const existing = cart.find(item => item.id == service.id);
    if (existing) existing.quantity += 1;
    else cart.push({ id: service.id, name: service.title, price: service.price, image: service.image || '', quantity: 1 });
    saveCart();
    const lang = localStorage.getItem('language') || 'ru';
    let addedText = 'добавлен в корзину!';
    if (typeof window.translations !== 'undefined' && window.translations[lang] && window.translations[lang]['cart-added']) {
        addedText = window.translations[lang]['cart-added'];
    }
    showToast(`"${service.title}" ${addedText}`);
}

function removeFromCart(index) { if (index >= 0 && index < cart.length) { cart.splice(index, 1); saveCart(); } }

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalPriceEl = document.getElementById('cart-total-price');
    if (!container || !totalPriceEl) return;
    
    const lang = localStorage.getItem('language') || 'ru';
    const dict = typeof translations !== 'undefined' ? translations[lang] : {};

    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 20px 0; color: var(--text-muted); font-size: 14px; line-height: 1.5;"><p style="margin-bottom: 5px;">${dict['cart-empty-1'] || 'Корзина пуста'}</p><p style="font-size: 12px;">${dict['cart-empty-2'] || ''}</p></div>`;
        totalPriceEl.innerText = '0 ₽';
    } else {
        let total = 0;
        let html = '';
        cart.forEach((item, index) => {
            if (!item.name) return; 
            const itemTotal = (item.price || 0) * item.quantity;
            total += itemTotal;
            const priceText = item.price > 0 ? item.price.toLocaleString('ru-RU') + ' ₽' : (dict['price-request'] || 'По запросу');
            html += `<div class="checkout-item" style="display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border-color); align-items: center;">
                <div class="checkout-item-img" style="width: 50px; height: 50px; border-radius: 8px; background: #f0f0f0; overflow: hidden; flex-shrink: 0;">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover;">` : ''}
                </div>
                <div class="checkout-item-info" style="flex: 1;">
                    <div class="checkout-item-name" style="font-size: 14px; font-weight: 600; color: var(--text-main); margin-bottom: 2px;">${item.name}</div>
                    <div class="checkout-item-category" style="font-size: 12px; color: var(--text-muted); margin-bottom: 2px;">${dict['service-label'] || 'услуга'}</div>
                    <div class="checkout-item-price" style="font-size: 13px; color: var(--primary); font-weight: 600;">${priceText}</div>
                </div>
                <div class="checkout-item-qty" style="width: 30px; height: 30px; border: 1px solid var(--border-color); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; background: white;">${item.quantity}</div>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; cursor:pointer; color:#999; font-size:18px; margin-left:5px;">&times;</button>
            </div>`;
        });
        container.innerHTML = html;
        totalPriceEl.innerText = total.toLocaleString('ru-RU') + ' ₽';
    }
}

/* =========================================
   ОТРИСОВКА УСЛУГ
   ========================================= */
function renderServices(services) {
    const container = document.getElementById('services-container');
    if (!container) return;
    const lang = localStorage.getItem('language') || 'ru';
    const dict = typeof translations !== 'undefined' ? translations[lang] : {};
    container.innerHTML = '';
    if (!services || services.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">${dict['nothing-found'] || 'Nothing found'}</p>`;
        return;
    }
    services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = service.id;
        card.dataset.price = service.price || 0; 
        const title = lang === 'en' ? (service.title_en || service.title) : service.title;
        const desc = lang === 'en' ? (service.description_en || service.description) : service.description;
        const btnText = dict['btn-details'] || 'Details';
        card.innerHTML = `<div class="card-img-wrapper"><img src="${service.image}" alt="${title}"></div><h3>${title}</h3><p>${desc}</p><button class="btn-outline">${btnText}</button>`;
        container.appendChild(card);
    });
}

/* =========================================
   ФУНКЦИИ МОДАЛОК
   ========================================= */

window.openContactsModal = function(e) { 
    if(e) e.preventDefault(); 
    const m = document.getElementById('contacts-modal'); 
    if(m) m.style.display = 'flex'; 
}
window.closeContactsModal = function() { 
    const m = document.getElementById('contacts-modal'); 
    if(m) m.style.display = 'none'; 
}

window.openSuccessModal = function() { 
    const m = document.getElementById('success-modal'); 
    if(m) m.style.display = 'flex'; 
}
window.closeSuccessModal = function() { 
    const m = document.getElementById('success-modal'); 
    if(m) m.style.display = 'none'; 
}

window.openCheckoutModal = function() {
    const modal = document.getElementById('checkout-modal');
    const listContainer = document.getElementById('checkout-items-list');
    const totalPriceEl = document.getElementById('checkout-total-price');
    const lang = localStorage.getItem('language') || 'ru';
    const dict = typeof translations !== 'undefined' ? translations[lang] : {};
    
    if (modal && listContainer && totalPriceEl) {
        listContainer.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            if (!item.name) return;
            const itemTotal = (item.price || 0) * item.quantity;
            total += itemTotal;
            const priceText = item.price > 0 ? item.price.toLocaleString('ru-RU') + ' ₽' : (dict['price-request'] || 'По запросу');
            listContainer.innerHTML += `
                <div style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px; align-items:center;">
                    <img src="${item.image || ''}" style="width:50px; height:50px; border-radius:6px; object-fit:cover; background:#f0f0f0;">
                    <div style="flex:1;">
                        <div style="font-weight:bold; font-size:14px;">${item.name}</div>
                        <div style="font-size:12px; color:#666;">${dict['service-label'] || 'услуга'}</div>
                        <div style="color:var(--primary); font-weight:bold; font-size:13px;">${priceText}</div>
                    </div>
                    <div style="border:1px solid #ddd; padding:2px 8px; border-radius:4px; font-size:14px;">${item.quantity}</div>
                </div>`;
        });
        totalPriceEl.innerText = total.toLocaleString('ru-RU') + ' ₽';
        
        modal.style.display = 'flex';
    }
}
window.closeCheckoutModal = function() { 
    const m = document.getElementById('checkout-modal'); 
    if(m) m.style.display = 'none'; 
}

window.openSubscriptionModal = function() { 
    const m = document.getElementById('subscription-modal'); 
    if(m) m.style.display = 'flex'; 
}
window.closeSubscriptionModal = function() { 
    const m = document.getElementById('subscription-modal'); 
    if(m) m.style.display = 'none'; 
}

window.openSuccessSubscriptionModal = function() { 
    const m = document.getElementById('success-subscription-modal'); 
    if(m) m.style.display = 'flex'; 
}
window.closeSuccessSubscriptionModal = function() { 
    const m = document.getElementById('success-subscription-modal'); 
    if(m) m.style.display = 'none'; 
}

function toggleSelectOptions() {
    const options = document.getElementById('select-options');
    if (options) options.style.display = options.style.display === 'none' || options.style.display === '' ? 'block' : 'none';
}
function selectOption(value) {
    const label = document.getElementById('select-label');
    const input = document.getElementById('contact-method-sub');
    const options = document.getElementById('select-options');
    if (label) label.innerText = value;
    if (input) input.value = value;
    if (options) options.style.display = 'none';
}

window.openPlanDetailsModal = function(titleKey, priceKey, descKey) {
    const modal = document.getElementById('plan-details-modal');
    const titleEl = document.getElementById('plan-modal-title');
    const priceEl = document.getElementById('plan-modal-price');
    const descEl = document.getElementById('plan-modal-desc');
    
    if (!modal || !titleEl || !priceEl || !descEl) return;

    const currentLang = localStorage.getItem('language') || 'ru';
    let t = titleKey, p = priceKey, d = descKey;
    if (typeof window.translations !== 'undefined' && window.translations[currentLang]) {
        t = window.translations[currentLang][titleKey] || titleKey;
        p = window.translations[currentLang][priceKey] || priceKey;
        d = window.translations[currentLang][descKey] || descKey;
    }

    titleEl.textContent = t;
    priceEl.textContent = p;
    descEl.textContent = d;
    
    modal.style.display = 'flex';
};

window.closePlanDetailsModal = function() { 
    const m = document.getElementById('plan-details-modal'); 
    if (m) m.style.display = 'none'; 
};

window.openContactsModal = function(e) { 
    if(e) e.preventDefault(); 
    const m = document.getElementById('contacts-modal'); 
    if(m) m.style.display = 'flex'; 
}
window.closeContactsModal = function() { 
    const m = document.getElementById('contacts-modal'); 
    if(m) m.style.display = 'none'; 
}