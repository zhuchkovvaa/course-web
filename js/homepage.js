// Глобальные переменные для хранения состояния
let allServices = []; // Все загруженные услуги
let filteredServices = []; // Отфильтрованные услуги
let currentPage = 1;
const itemsPerPage = 6; // Показывать по 6 услуг на странице

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('services-container');
    const searchInput = document.getElementById('service-search');
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');
    const paginationContainer = document.getElementById('pagination');

    if (!container) return;

    try {
        // 1. Загрузка данных с сервера
        const response = await fetch('http://localhost:3000/services');
        if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);
        
        allServices = await response.json();
        filteredServices = [...allServices]; // Копия всех услуг

        // 2. Навешиваем обработчики событий
        searchInput.addEventListener('input', applyFiltersAndSort);
        categoryFilter.addEventListener('change', applyFiltersAndSort);
        sortSelect.addEventListener('change', applyFiltersAndSort);

        // 3. Первичная отрисовка
        renderServices();
        renderPagination();

    } catch (error) {
        console.error('Не удалось загрузить услуги:', error);
        container.innerHTML = '<p style="color:red">Ошибка загрузки данных. Убедитесь, что JSON Server запущен.</p>';
    }

    // Функция применения фильтров и сортировки
    function applyFiltersAndSort() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;
        const sortValue = sortSelect.value;

        // Фильтрация
        filteredServices = allServices.filter(service => {
            const matchesSearch = service.title.toLowerCase().includes(searchTerm) || 
                                  service.description.toLowerCase().includes(searchTerm);
            const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        // Сортировка
        filteredServices.sort((a, b) => {
            switch (sortValue) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'title-asc': return a.title.localeCompare(b.title);
                default: return a.id - b.id; // По умолчанию по ID
            }
        });

        // Сброс на первую страницу при изменении фильтров
        currentPage = 1;
        renderServices();
        renderPagination();
    }

    // Функция отрисовки карточек текущей страницы
    function renderServices() {
        container.innerHTML = '';
        
        if (filteredServices.length === 0) {
            container.innerHTML = '<p class="no-results">Ничего не найдено</p>';
            paginationContainer.innerHTML = '';
            return;
        }

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = filteredServices.slice(start, end);

        pageItems.forEach(service => {
            const card = document.createElement('article');
            card.className = 'service-card';
            card.innerHTML = `
                <div class="card-image-placeholder">IMG</div>
                <div class="card-content">
                    <h3 class="card-title">${service.title}</h3>
                    <p class="card-desc">${service.description}</p>
                    <div class="card-footer">
                        <span class="card-price">${service.price} BYN</span>
                        <button class="btn-order">Подробнее</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Функция отрисовки пагинации
    function renderPagination() {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

        if (totalPages <= 1) return; // Пагинация не нужна, если всего 1 страница

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = i === currentPage ? 'active' : '';
            
            btn.addEventListener('click', () => {
                currentPage = i;
                renderServices();
                renderPagination();
            });

            paginationContainer.appendChild(btn);
        }
    }
});