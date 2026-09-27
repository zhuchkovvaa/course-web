document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reg-form');
    const submitBtn = document.getElementById('submit-btn');
    const genNickBtn = document.getElementById('gen-nick-btn');
    const nicknameInput = document.getElementById('nickname');
    
    // Поля для валидации
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const dobInput = document.getElementById('dob');
    const passInput = document.getElementById('password');
    const agreementCheck = document.getElementById('agreement');

    // 1. АВТОГЕНЕРАЦИЯ НИКНЕЙМА
    let nickAttempts = 0;
    if (genNickBtn) {
        genNickBtn.addEventListener('click', () => {
            nickAttempts++;
            
            if (nickAttempts > 5) {
                nicknameInput.removeAttribute('readonly');
                nicknameInput.placeholder = 'Введите никнейм вручную';
                nicknameInput.focus();
                genNickBtn.textContent = '✓ Готово';
                genNickBtn.disabled = true;
                return;
            }

            const adjectives = ['Super', 'Mega', 'Pro', 'Fast', 'Cool', 'Smart', 'Top', 'Best'];
            const nouns = ['User', 'Dev', 'Coder', 'Boss', 'Star', 'Hero', 'Master', 'Expert'];
            const randomNick = adjectives[Math.floor(Math.random() * adjectives.length)] + 
                               nouns[Math.floor(Math.random() * nouns.length)] + 
                               Math.floor(Math.random() * 1000);
            nicknameInput.value = randomNick;
            validateForm();
        });
    }

    // 2. ВАЛИДАЦИЯ ПРИ ВВОДЕ
    [phoneInput, emailInput, dobInput, passInput, agreementCheck].forEach(input => {
        if (input) {
            input.addEventListener('input', validateForm);
            input.addEventListener('change', validateForm);
        }
    });

    function validateForm() {
        let isValid = true;

        if (phoneInput && !(/^\+375\d{9}$/.test(phoneInput.value.replace(/\s/g, '')))) {
            showError('phone-error', 'Формат: +375XXXXXXXXX');
            isValid = false;
        } else { clearError('phone-error'); }

        if (emailInput && !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value))) {
            showError('email-error', 'Введите корректный email');
            isValid = false;
        } else { clearError('email-error'); }

        if (dobInput && dobInput.value) {
            const birthDate = new Date(dobInput.value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
            
            if (age < 16) {
                showError('dob-error', 'Регистрация доступна только с 16 лет');
                isValid = false;
            } else { clearError('dob-error'); }
        }

        if (passInput && !(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(passInput.value))) {
            showError('pass-error', '8-20 симв., A-Z, a-z, 0-9, @$!%*?&');
            isValid = false;
        } else { clearError('pass-error'); }

        if (agreementCheck && !agreementCheck.checked) {
            showError('agree-error', 'Необходимо принять правила сервиса');
            isValid = false;
        } else { clearError('agree-error'); }

        if (nicknameInput && !nicknameInput.value) {
            showError('nick-error', 'Сгенерируйте или введите никнейм');
            isValid = false;
        } else { clearError('nick-error'); }

        if (submitBtn) submitBtn.disabled = !isValid;
    }

    function showError(id, msg) {
        const el = document.getElementById(id);
        if (el) { el.textContent = msg; el.style.display = 'block'; }
    }

    function clearError(id) {
        const el = document.getElementById(id);
        if (el) { el.textContent = ''; el.style.display = 'none'; }
    }

    // 3. ЛОГИКА РЕГИСТРАЦИИ
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Автоматически назначаем роль admin для этого email
            const isAdmin = emailInput.value.toLowerCase() === 'admin@enterpriseapp.ru';
            
            const newUser = {
                phone: phoneInput.value,
                email: emailInput.value,
                dob: dobInput.value,
                fullname: document.getElementById('fullname').value,
                nickname: nicknameInput.value,
                password: passInput.value,
                role: isAdmin ? 'admin' : 'user',
                createdAt: new Date().toISOString()
            };

            try {
                const response = await fetch('http://localhost:3000/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                });

                if (response.ok) {
                    const createdUser = await response.json();
                    
                    // Сохраняем текущего пользователя в localStorage
                    localStorage.setItem('currentUser', JSON.stringify(createdUser));
                    
                    // !!! НОВОЕ: Создаем пустую личную корзину для нового пользователя !!!
                    const userCartKey = `cart_${createdUser.nickname}`;
                    if (!localStorage.getItem(userCartKey)) {
                        localStorage.setItem(userCartKey, JSON.stringify([]));
                    }
                    
                    alert('Регистрация успешна! Добро пожаловать, ' + createdUser.nickname);
                    window.location.href = 'index.html';
                } else {
                    const errData = await response.json();
                    alert('Ошибка: ' + (errData.message || 'Такой пользователь уже существует'));
                }
            } catch (err) {
                console.error(err);
                alert('Не удалось подключиться к серверу. Убедитесь, что json-server запущен.');
            }
        });
    }
});