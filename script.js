// ========== НАСТРОЙКИ ==========
const API_URL = "https://6acb9b2eef37b1504078101f.mockapi.io/techniques";
const ADMIN_PASSWORD = "88888888"; // пароль

// ========== ПЕРЕМЕННЫЕ ==========
let allTechniques = [];

// ========== ЗАГРУЗКА ПРИЁМОВ ==========
async function loadTechniques() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Ошибка сети");
        allTechniques = await response.json();
        console.log("Приёмы загружены:", allTechniques.length);
    } catch (error) {
        console.error("Ошибка загрузки:", error);
        alert("Не удалось загрузить приёмы. Проверьте интернет.");
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

// ========== ПОКАЗАТЬ ВСЕ ПРИЁМЫ ==========
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
                style="margin-top:8px; background:#e53e3e; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">
                Удалить
            </button>
        `;
        ul.appendChild(li);
    });
    container.appendChild(ul);

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteTechnique);
    });
}

// ========== УДАЛЕНИЕ ==========
async function handleDeleteTechnique(event) {
    const password = prompt("Введите пароль администратора:");
    if (password !== ADMIN_PASSWORD) {
        alert("Неверный пароль.");
        return;
    }

    const id = event.target.dataset.id;
    const technique = allTechniques.find(t => t.id == id);
    if (!technique) return;

    if (!confirm(`Удалить приём «${technique.name}»?`)) return;

    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        allTechniques = allTechniques.filter(t => t.id != id);
        displayAllTechniques();
        alert("Приём удалён.");
    } catch (error) {
        alert("Ошибка при удалении.");
    }
}

// ========== ДОБАВЛЕНИЕ ==========
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

    const newTechnique = { name, description: description || '' };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTechnique)
        });
        const created = await response.json();
        allTechniques.push(created);
        toggleAddForm(false);
        alert('Приём добавлен!');
        
        if (document.getElementById('all-techniques-container').style.display === 'block') {
            displayAllTechniques();
        }
    } catch (error) {
        alert("Ошибка при добавлении приёма.");
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