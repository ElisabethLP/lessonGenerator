// ========== НАСТРОЙКИ ==========
const API_KEY = "692034921bcfc838bcdf17cdb79377e9";
const API_URL = "https://jsonbox.ru/api.php";
const ADMIN_PASSWORD = "88888888";

// Версия базового набора. Увеличьте (например, до "1.1"),
// когда измените массив DEFAULT_TECHNIQUES ниже.
const BASE_VERSION = "1.0";

// ========== БАЗОВЫЕ ПРИЁМЫ ==========
// Используются только при первом запуске, когда база JsonBox пуста.
// Флаг base: true позволяет отличать базовые приёмы от пользовательских
// и обновлять их, не затрагивая то, что добавили пользователи.
const DEFAULT_TECHNIQUES = [
    { base: true, name: "Мозговой штурм", category: "актуализация", description: "Генерация идей за короткое время, без критики." },
    { base: true, name: "Вопрос к классу", category: "актуализация", description: "Учитель задаёт вопрос по прошлой теме, чтобы вспомнить материал." },
    { base: true, name: "Кластер", category: "актуализация", description: "Учащиеся записывают ассоциации по теме на доске или в тетради." },
    { base: true, name: "Работа в малых группах", category: "основной этап", description: "Учащиеся разбиваются на мини-группы для обсуждения." },
    { base: true, name: "Обсуждение в парах", category: "основной этап", description: "Двое учащихся обсуждают тему или вопрос." },
    { base: true, name: "Кейс-стади", category: "основной этап", description: "Анализ конкретной ситуации или проблемы." },
    { base: true, name: "Дебаты", category: "основной этап", description: "Спор по теме с аргументами «за» и «против»." },
    { base: true, name: "Мини-лекция", category: "основной этап", description: "Краткое изложение учителем основного материала." },
    { base: true, name: "Ролевая игра", category: "основной этап", description: "Учащиеся играют роли для лучшего понимания ситуации." },
    { base: true, name: "Решение задач", category: "закрепление", description: "Практическое применение знаний для решения задач." },
    { base: true, name: "Лови ошибку", category: "закрепление", description: "Учитель намеренно допускает ошибку, ученики должны её найти." },
    { base: true, name: "Презентация учащегося", category: "закрепление", description: "Доклад одного или нескольких учащихся по теме." },
    { base: true, name: "Взаимопроверка", category: "закрепление", description: "Ученики проверяют работы друг друга по критериям." },
    { base: true, name: "Зарядка для глаз", category: "физкультминутка", description: "Короткие упражнения для глаз, чтобы снять напряжение." },
    { base: true, name: "Разминка на месте", category: "физкультминутка", description: "Простые движения: наклоны, потягивания, хлопки." },
    { base: true, name: "Синквейн", category: "рефлексия", description: "Пятистишие по теме урока: существительное, прилагательные, глаголы, фраза, итог." },
    { base: true, name: "Незаконченное предложение", category: "рефлексия", description: "Ученики продолжают фразу: «Сегодня я узнал…»." },
    { base: true, name: "Дерево успеха", category: "рефлексия", description: "Ученики отмечают, что получилось хорошо, а что ещё нужно доработать." },
    { base: true, name: "Плюс / минус / интересно", category: "рефлексия", description: "Ученики записывают, что понравилось, что нет и что удивило." },
    { base: true, name: "Светофор", category: "рефлексия", description: "Зелёный — всё понятно, жёлтый — есть вопросы, красный — не понял." }
];

let allTechniques = [];
let lastGenerated = [];
let currentFilter = "all";

// ========== РЕЗЕРВНАЯ КОПИЯ (localStorage) ==========

function saveBackup() {
    try {
        localStorage.setItem("techniquesBackup", JSON.stringify(allTechniques));
        localStorage.setItem("techniquesBackupTime", new Date().toISOString());
    } catch (e) {
        console.warn("Не удалось сохранить резервную копию:", e);
    }
}

function restoreFromBackup() {
    try {
        const saved = localStorage.getItem("techniquesBackup");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {}
    return null;
}

// ========== ВЕРСИЯ БАЗОВОГО НАБОРА ==========

function shouldUpdateBase() {
    const currentVersion = localStorage.getItem("baseVersion");
    if (currentVersion !== BASE_VERSION) {
        localStorage.setItem("baseVersion", BASE_VERSION);
        return true;
    }
    return false;
}

// ========== ХРАНЕНИЕ (JsonBox) ==========

async function loadTechniques() {
    try {
        const response = await fetch(`${API_URL}?action=get&api_key=${API_KEY}`);
        if (!response.ok) throw new Error("Не удалось загрузить приёмы");

        const data = await response.json();
        let raw = data.data ?? data;

        if (raw && raw.techniques && Array.isArray(raw.techniques)) {
            allTechniques = raw.techniques;
        } else if (Array.isArray(raw)) {
            allTechniques = raw.map(item => item.data ?? item);
        } else {
            allTechniques = [];
        }

        // Первый запуск — база пуста, заливаем базовые приёмы
        if (allTechniques.length === 0) {
            allTechniques = DEFAULT_TECHNIQUES.map((t, i) => ({
                id: Date.now() + i,
                ...t
            }));
            await saveTechniques();
        } else {
            // База не пуста. Если изменилась версия базового набора —
            // обновляем ТОЛЬКО базовые приёмы, не трогая пользовательские.
            const hasBase = allTechniques.some(t => t.base === true);
            if (hasBase && shouldUpdateBase()) {
                const userTechniques = allTechniques.filter(t => t.base !== true);
                const newBaseTechniques = DEFAULT_TECHNIQUES.map((t, i) => ({
                    id: Date.now() + i,
                    ...t
                }));
                allTechniques = [...newBaseTechniques, ...userTechniques];
                await saveTechniques();
            }
        }

        // Присваиваем id тем приёмам, у которых его нет
        allTechniques = allTechniques.map((t, i) => ({
            id: t.id ?? Date.now() + i,
            name: t.name || "Без названия",
            category: t.category || "основной этап",
            description: t.description || "",
            base: t.base === true
        }));

    } catch (e) {
        console.error("Ошибка загрузки:", e);
        const backup = restoreFromBackup();
        if (backup) {
            allTechniques = backup;
            console.log("Использована резервная копия из localStorage");
            alert("Сервер недоступен. Используется локальная копия.");
        } else {
            allTechniques = DEFAULT_TECHNIQUES.map((t, i) => ({
                id: Date.now() + i,
                ...t
            }));
            alert("Не удалось загрузить приёмы. Используются стандартные.");
        }
    }
}

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
        saveBackup();
    } catch (e) {
        console.error("Ошибка сохранения:", e);
        alert("Не удалось сохранить данные. Локальная копия сохранена.");
    }
}

async function createTechnique(technique) {
    const newTech = {
        id: Date.now(),
        name: technique.name,
        category: technique.category,
        description: technique.description || "",
        base: false
    };
    allTechniques.push(newTech);
    await saveTechniques();
    return newTech;
}

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

// Склонение слова «приём»
function plural(n, forms) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
    return forms[2];
}

// Обновление счётчика приёмов
function updateTechniquesCount() {
    const el = document.getElementById("techniques-count");
    if (!el) return;

    const total = allTechniques.length;
    const word = plural(total, ["приём", "приёма", "приёмов"]);
    el.textContent = `В базе ${total} ${word}`;

    el.classList.remove("updated");
    void el.offsetWidth;
    el.classList.add("updated");
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

    categories.forEach(cat => {
        const pool = allTechniques.filter(t => t.category === cat && !usedIds.has(t.id));
        if (pool.length > 0) {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            selected.push(pick);
            usedIds.add(pick.id);
        }
    });

    if (Math.random() < 0.5) {
        const fiz = allTechniques.filter(t => t.category === "физкультминутка" && !usedIds.has(t.id));
        if (fiz.length > 0) {
            selected.splice(2, 0, fiz[Math.floor(Math.random() * fiz.length)]);
        }
    }

    if (selected.length < 3) {
        const rest = shuffleArray(allTechniques.filter(t => !usedIds.has(t.id)));
        while (selected.length < 3 && rest.length > 0) {
            selected.push(rest.pop());
        }
    }

    lastGenerated = selected;
    displayLessonStructure(selected);
    document.getElementById("result-actions").style.display = "flex";
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
        btn.textContent = "✅ Скопировано!";
        btn.classList.add("copied");
        setTimeout(() => {
            btn.textContent = old;
            btn.classList.remove("copied");
        }, 1500);
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

function toggleAllTechniques() {
    const container = document.getElementById("all-techniques-container");
    const mainBtn = document.getElementById("show-all-button");
    const closeWrapper = document.getElementById("close-list-wrapper");

    if (container.style.display === "block") {
        container.style.display = "none";
        closeWrapper.style.display = "none";
        mainBtn.textContent = "Показать все приёмы";
    } else {
        displayAllTechniques();
        closeWrapper.style.display = "block";
        mainBtn.textContent = "Скрыть список";
    }
}

function hideAllTechniques() {
    const container = document.getElementById("all-techniques-container");
    const mainBtn = document.getElementById("show-all-button");
    const closeWrapper = document.getElementById("close-list-wrapper");

    container.style.display = "none";
    closeWrapper.style.display = "none";
    mainBtn.textContent = "Показать все приёмы";
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

// ========== УДАЛЕНИЕ (пароль + подтверждение) ==========
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
        updateTechniquesCount();
        displayAllTechniques();
        alert("Приём удалён.");
    } catch (e) {
        console.error("Ошибка удаления:", e);
        alert("Не удалось удалить приём.");
    }
}

// ========== ДОБАВЛЕНИЕ (проверка пустых полей) ==========
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
        updateTechniquesCount();
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

// ========== ОПРЕДЕЛЕНИЕ ПРОИЗВОДИТЕЛЬНОСТИ ==========
function isLowPowerDevice() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    if (window.matchMedia("(prefers-reduced-data: reduce)").matches) return true;

    const cores = navigator.hardwareConcurrency || 4;
    if (cores <= 2) return true;

    const memory = navigator.deviceMemory || 4;
    if (memory <= 2) return true;

    if (window.innerWidth < 360) return true;

    const conn = navigator.connection;
    if (conn) {
        if (conn.saveData) return true;
        if (["slow-2g", "2g", "3g"].includes(conn.effectiveType)) return true;
    }

    return false;
}

// ========== ЗАПУСК ==========
document.addEventListener("DOMContentLoaded", async () => {
    if (isLowPowerDevice()) {
        document.body.classList.add("reduced-motion");
    }

    await loadTechniques();
    updateTechniquesCount();

    document.getElementById("generate-button").addEventListener("click", generateLessonStructure);
    document.getElementById("regenerate-button").addEventListener("click", generateLessonStructure);
    document.getElementById("copy-button").addEventListener("click", copyStructure);
    document.getElementById("show-all-button").addEventListener("click", toggleAllTechniques);
    document.getElementById("hide-all-button").addEventListener("click", hideAllTechniques);
    document.getElementById("show-add-form-button").addEventListener("click", () => toggleAddForm(true));
    document.getElementById("cancel-add-button").addEventListener("click", () => toggleAddForm(false));
    document.getElementById("add-technique-form").addEventListener("submit", handleAddTechnique);

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => setFilter(btn.dataset.category));
    });
});