// ========== НАСТРОЙКИ ==========
const API_KEY = "692034921bcfc838bcdf17cdb79377e9";
const API_URL = "https://jsonbox.ru/api.php";
const ADMIN_PASSWORD = "88888888";

// Базовые приёмы — используются только при первом запуске
const DEFAULT_TECHNIQUES = [
    { name: "Мозговой штурм", category: "актуализация", description: "Генерация идей за короткое время, без критики." },
    { name: "Вопрос к классу", category: "актуализация", description: "Учитель задаёт вопрос по прошлой теме, чтобы вспомнить материал." },
    { name: "Кластер", category: "актуализация", description: "Учащиеся записывают ассоциации по теме на доске или в тетради." },
    { name: "Работа в малых группах", category: "основной этап", description: "Учащиеся разбиваются на мини-группы для обсуждения." },
    { name: "Обсуждение в парах", category: "основной этап", description: "Двое учащихся обсуждают тему или вопрос." },
    { name: "Кейс-стади", category: "основной этап", description: "Анализ конкретной ситуации или проблемы." },
    { name: "Дебаты", category: "основной этап", description: "Спор по теме с аргументами «за» и «против»." },
    { name: "Мини-лекция", category: "основной этап", description: "Краткое изложение учителем основного материала." },
    { name: "Ролевая игра", category: "основной этап", description: "Учащиеся играют роли для лучшего понимания ситуации." },
    { name: "Решение задач", category: "закрепление", description: "Практическое применение знаний для решения задач." },
    { name: "Лови ошибку", category: "закрепление", description: "Учитель намеренно допускает ошибку, ученики должны её найти." },
    { name: "Презентация учащегося", category: "закрепление", description: "Доклад одного или нескольких учащихся по теме." },
    { name: "Взаимопроверка", category: "закрепление", description: "Ученики проверяют работы друг друга по критериям." },
    { name: "Зарядка для глаз", category: "физкультминутка", description: "Короткие упражнения для глаз, чтобы снять напряжение." },
    { name: "Разминка на месте", category: "физкультминутка", description: "Простые движения: наклоны, потягивания, хлопки." },
    { name: "Синквейн", category: "рефлексия", description: "Пятистишие по теме урока: существительное, прилагательные, глаголы, фраза, итог." },
    { name: "Незаконченное предложение", category: "рефлексия", description: "Ученики продолжают фразу: «Сегодня я узнал…»." },
    { name: "Дерево успеха", category: "рефлексия", description: "Ученики отмечают, что получилось хорошо, а что ещё нужно доработать." },
    { name: "Плюс / минус / интересно", category: "рефлексия", description: "Ученики записывают, что понравилось, что нет и что удивило." },
    { name: "Светофор", category: "рефлексия", description: "Зелёный — всё понятно, жёлтый — есть вопросы, красный — не понял." }
];

let allTechniques = [];
let lastGenerated = [];
let currentFilter = "all";

// ========== ХРАНЕНИЕ (JsonBox) ==========

// Загрузка всех приёмов с сервера
async function loadTechniques() {
    try {
        const response = await fetch(`${API_URL}?action=get&api_key=${API_KEY}`);
        if (!response.ok) throw new Error("Не удалось загрузить приёмы");

        const data = await response.json();

        // JsonBox возвращает данные в разных форматах — нормализуем
        let raw = data.data ?? data;

        // Если это объект с ключом techniques
        if (raw && raw.techniques && Array.isArray(raw.techniques)) {
            allTechniques = raw.techniques;
        } else if (Array.isArray(raw)) {
            // Если это просто массив (может быть массив записей JsonBox)
            allTechniques = raw.map(item => item.data ?? item);
        } else {
            // База пуста — заполняем базовыми приёмами
            allTechniques = [...DEFAULT_TECHNIQUES];
            await saveTechniques();
        }

        // Если база пустая — заполняем
        if (!Array.isArray(allTechniques) || allTechniques.length === 0) {
            allTechniques = [...DEFAULT_TECHNIQUES];
            await saveTechniques();
        }

        // Присваиваем id, если их нет
        allTechniques = allTechniques.map((t, i) => ({
            id: t.id ?? Date.now() + i,
            name: t.name || "Без названия",
            category: t.category || "основной этап",
            description: t.description || ""
        }));

    } catch (e) {
        console.error("Ошибка загрузки:", e);
        allTechniques = [...DEFAULT_TECHNIQUES];
        allTechniques = allTechniques.map((t, i) => ({
            id: Date.now() + i,
            ...t
        }));
        alert("Не удалось загрузить приёмы с сервера. Используются стандартные.");
    }
}

// Сохранение всех приёмов (перезапись целиком)
async function saveTechniques() {
    try {
        const response = await fetch(`${API_URL}?action=store`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: API_KEY,
                data: { techniques: allTechniques }
            })
        });
        if (!response.ok) throw new Error("Не удалось сохранить");
    } catch (e) {
        console.error("Ошибка сохранения:", e);
        alert("Не удалось сохранить данные. Проверьте интернет.");
    }
}

// Добавление приёма (локально + сохранение)
async function createTechnique(technique) {
    const newTech = {
        id: Date.now(),
        name: technique.name,
        category: technique.category,
        description: technique.description || ""
    };
    allTechniques.push(newTech);
    await saveTechniques();
    return newTech;
}

// Удаление приёма по id
async function deleteTechniqueById(id) {
    allTechniques = allTechniques.filter(t => String(t.id) !== String(id));
    await saveTechniques();
}

// ========== УТИЛИТЫ ==========
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========== ГЕНЕРАЦИЯ ==========
function generateLessonStructure() {
    if (allTechniques.length === 0) {
        alert("Список приёмов пуст.");
        return;
    }

    const categories = ["актуализация", "основной этап", "закрепление", "рефлексия"];
    const selected = [];
    const usedIds = new Set();

    // Берём по одному из ключевых категорий
    categories.forEach(cat => {
        const pool = allTechniques.filter(t => t.category === cat && !usedIds.has(t.id));
        if (pool.length > 0) {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            selected.push(pick);
            usedIds.add(pick.id);
        }
    });

    // Иногда добавляем физкультминутку
    if (Math.random() < 0.5) {
        const fiz = allTechniques.filter(t => t.category === "физкультминутка" && !usedIds.has(t.id));
        if (fiz.length > 0) {
            selected.splice(2, 0, fiz[Math.floor(Math.random() * fiz.length)]);
        }
    }

    // Если мало — добираем случайными
    if (selected.length < 3) {
        const rest = shuffleArray(allTechniques.filter(t => !usedIds.has(t.id)));
        while (selected.length < 3 && rest.length > 0) {
            selected.push(rest.pop());
        }
    }

    lastGenerated = selected;
    displayLessonStructure(selected);
    const actions = document.getElementById("result-actions");
    if (actions) actions.style.display = "flex";
}

function displayLessonStructure(techniques) {
    const container = document.getElementById("lesson-structure-container");
    container.innerHTML = "";

    if (!techniques.length) {
        container.innerHTML = "<p>Приёмы не выбраны.</p>";
        return;
    }

    const ul = document.createElement("ul");
    techniques.forEach((tech, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="category-tag">${capitalize(tech.category)}</span>

            <strong>${index + 1}. ${tech.name}</strong>

            ${tech.description || "Нет описания"}
        `;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

// ========== КОПИРОВАНИЕ ==========
function copyStructure() {
    if (!lastGenerated.length) {
        alert("Сначала создайте структуру урока.");
        return;
    }

    const text = lastGenerated
        .map((t, i) => `${i + 1}. [${capitalize(t.category)}] ${t.name} — ${t.description || "без описания"}`)
        .join("\n");

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById("copy-button");
        const old = btn.textContent;
        btn.textContent = "Скопировано!";
        setTimeout(() => { btn.textContent = old; }, 1500);
    }).catch(() => {
        prompt("Скопируйте текст вручную (Ctrl+C):", text);
    });
}

// ========== СПИСОК ВСЕХ ПРИЁМОВ ==========
function displayAllTechniques() {
    const container = document.getElementById("all-techniques-container");
    container.style.display = "block";
    container.innerHTML = "";

    let list = allTechniques;
    if (currentFilter !== "all") {
        list = allTechniques.filter(t => t.category === currentFilter);
    }

    if (list.length === 0) {
        container.innerHTML = "<p>В этой категории пока нет приёмов.</p>";
        return;
    }

    const ul = document.createElement("ul");
    list.forEach((tech, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="category-tag">${capitalize(tech.category)}</span>

            <strong>${index + 1}. ${tech.name}</strong>

            ${tech.description || "Нет описания"}
            

            <button class="delete-btn" data-id="${tech.id}">Удалить</button>
        `;
        ul.appendChild(li);
    });
    container.appendChild(ul);

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", handleDeleteTechnique);
    });
}

function setFilter(category) {
    currentFilter = category;
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.category === category);
    });
    if (document.getElementById("all-techniques-container").style.display === "block") {
        displayAllTechniques();
    }
}

// ========== УДАЛЕНИЕ ==========
async function handleDeleteTechnique(event) {
    const password = prompt("Введите пароль администратора:");
    if (password !== ADMIN_PASSWORD) {
        alert("Неверный пароль.");
        return;
    }

    const id = event.target.dataset.id;
    const tech = allTechniques.find(t => String(t.id) === String(id));
    if (!tech) return;

    if (!confirm(`Удалить приём «${tech.name}»?`)) return;

    try {
        await deleteTechniqueById(id);
        displayAllTechniques();
        alert("Приём удалён.");
    } catch (e) {
        console.error("Ошибка удаления:", e);
        alert("Не удалось удалить приём.");
    }
}

// ========== ДОБАВЛЕНИЕ ==========
function toggleAddForm(show) {
    const form = document.getElementById("add-technique-form");
    const btn = document.getElementById("show-add-form-button");

    if (show) {
        form.style.display = "block";
        btn.style.display = "none";
    } else {
        form.style.display = "none";
        btn.style.display = "inline-block";
        document.getElementById("technique-name").value = "";
        document.getElementById("technique-description").value = "";
        document.getElementById("technique-category").value = "";
    }
}

async function handleAddTechnique(event) {
    event.preventDefault();

    const name = document.getElementById("technique-name").value.trim();
    const category = document.getElementById("technique-category").value;
    const description = document.getElementById("technique-description").value.trim();

    if (!name) {
        alert("Введите название приёма.");
        return;
    }
    if (!category) {
        alert("Выберите категорию.");
        return;
    }

    try {
        await createTechnique({ name, category, description });
        toggleAddForm(false);
        alert("Приём добавлен!");

        if (document.getElementById("all-techniques-container").style.display === "block") {
            displayAllTechniques();
        }
    } catch (e) {
        console.error("Ошибка добавления:", e);
        alert("Не удалось сохранить приём.");
    }
}

// ========== ЗАПУСК ==========
document.addEventListener("DOMContentLoaded", async () => {
    await loadTechniques();

    document.getElementById("generate-button").addEventListener("click", generateLessonStructure);
    document.getElementById("regenerate-button").addEventListener("click", generateLessonStructure);
    document.getElementById("copy-button").addEventListener("click", copyStructure);
    document.getElementById("show-all-button").addEventListener("click", displayAllTechniques);
    document.getElementById("show-add-form-button").addEventListener("click", () => toggleAddForm(true));
    document.getElementById("cancel-add-button").addEventListener("click", () => toggleAddForm(false));
    document.getElementById("add-technique-form").addEventListener("submit", handleAddTechnique);

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => setFilter(btn.dataset.category));
    });
});