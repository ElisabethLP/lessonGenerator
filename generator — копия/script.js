// ========== НАСТРОЙКИ ==========
const BIN_ID = "6aca3116ac6210605a254c5b";
const API_KEY = "$2a$10$HqwI67byOuJbl7QVZ9i7e.0INdTSSup4UknNi8upvUl6PUF0YsC9S";
const ADMIN_PASSWORD = "88888888"; // ПАРОЛЬ ДЛЯ УДАЛЕНИЯ

const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ========== ПЕРЕМЕННЫЕ ==========
let allTechniques = [];

// ========== ЗАГРУЗКА ПРИЁМОВ ==========
async function loadTechniques() {
    try {
        const response = await fetch(BIN_URL + "/latest", {
            headers: {
                "X-Master-Key": API_KEY
            }
        });
        const data = await response.json();
        allTechniques = data.record;
        console.log("Приёмы загружены:", allTechniques.length);
    } catch (error) {
        console.error("Ошибка загрузки:", error);
        alert("Не удалось загрузить приёмы. Проверьте интернет и ключи.");
    }
}

// ========== СОХРАНЕНИЕ ПРИЁМОВ ==========
async function saveTechniques() {
    try {
        await fetch(BIN_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify(allTechniques)
        });
        console.log("Приёмы сохранены");
    } catch (error) {
        console.error("Ошибка сохранения:", error);
        alert("Не удалось сохранить изменения.");
    }
}

// ========== ГЕНЕРАЦИЯ ==========
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateLessonStructure() {
    if (allTechniques.length === 0) {
        alert("Приёмы ещё не загрузились. Подождите немного.");
        return;
    }

    const shuffled = shuffleArray([...allTechniques]);
    const num = Math.random() < 0.5 ? 3 : 4;
    const selected = shuffled.slice(0, num);
    displayLessonStructure(selected);
}

function displayLessonStructure(techniques) {
    const container = document.getElementById('lesson-structure-container');
    container.innerHTML = '';

    const ul = document.createElement('ul');
    techniques.forEach((tech, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${index + 1}. ${tech.name}</strong>
${tech.description || 'Нет описания'}`;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

// ========== ПОКАЗАТЬ ВСЕ ПРИЁМЫ + УДАЛЕНИЕ ==========
function displayAllTechniques() {
    const container = document.getElementById('all-techniques-container');
    container.innerHTML = '';
    container.style.display = 'block';

    if (allTechniques.length === 0) {
        container.innerHTML = '<p>Приёмов пока нет.</p>';
        return;
    }

    const ul = document.createElement('ul');

    allTechniques.forEach((tech, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${index + 1}. ${tech.name}</strong>

            ${tech.description || 'Нет описания'}
            

            <button class="delete-btn" data-id="${tech.id}" 
                style="margin-top:8px; background:#e53e3e; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:14px;">
                Удалить
            </button>
        `;
        ul.appendChild(li);
    });

    container.appendChild(ul);

    // Навешиваем обработчики на кнопки удаления
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteTechnique);
    });
}

// ========== УДАЛЕНИЕ ПРИЁМА ==========
async function handleDeleteTechnique(event) {
    const password = prompt("Введите пароль администратора:");

    if (password !== ADMIN_PASSWORD) {
        alert("Неверный пароль. Удаление запрещено.");
        return;
    }

    const id = Number(event.target.dataset.id);
    const technique = allTechniques.find(t => t.id === id);

    if (!technique) return;

    const confirmDelete = confirm(`Вы точно хотите удалить приём «${technique.name}»?`);
    if (!confirmDelete) return;

    // Удаляем из массива
    allTechniques = allTechniques.filter(t => t.id !== id);

    // Сохраняем в JSONBin
    await saveTechniques();

    // Обновляем список
    displayAllTechniques();
    alert("Приём успешно удалён.");
}

// ========== ДОБАВЛЕНИЕ ПРИЁМА ==========
function toggleAddForm(show) {
    const form = document.getElementById('add-technique-form');
    const btn = document.getElementById('show-add-form-button');

    if (show) {
        form.style.display = 'block';
        btn.style.display = 'none';
    } else {
        form.style.display = 'none';
        btn.style.display = 'inline-block';
        document.getElementById('technique-name').value = '';
        document.getElementById('technique-description').value = '';
    }
}

async function handleAddTechnique(event) {
    event.preventDefault();

    const name = document.getElementById('technique-name').value.trim();
    const description = document.getElementById('technique-description').value.trim();

    if (!name) {
        alert('Введите название приёма');
        return;
    }

    const newTechnique = {
        id: Date.now(),
        name: name,
        description: description || ''
    };

    allTechniques.push(newTechnique);
    await saveTechniques();
    toggleAddForm(false);
    alert('Приём добавлен и теперь виден всем!');

    // Обновляем список, если он открыт
    if (document.getElementById('all-techniques-container').style.display === 'block') {
        displayAllTechniques();
    }
}

// ========== ЗАПУСК ==========
document.addEventListener('DOMContentLoaded', async () => {
    await loadTechniques();

    document.getElementById('generate-button').addEventListener('click', generateLessonStructure);
    document.getElementById('show-all-button').addEventListener('click', displayAllTechniques);
    document.getElementById('show-add-form-button').addEventListener('click', () => toggleAddForm(true));
    document.getElementById('cancel-add-button').addEventListener('click', () => toggleAddForm(false));
    document.getElementById('add-technique-form').addEventListener('submit', handleAddTechnique);
});