// ========== НАСТРОЙКИ ==========
const API_URL = "https://6acb9b2eef37b1504078101f.mockapi.io/techniques";
const ADMIN_PASSWORD = "88888888";
const BASE_VERSION = "1.4"; // Версия для обновления базы

// ========== БАЗОВЫЕ ПРИЁМЫ ==========
const DEFAULT_TECHNIQUES = [
    { base: true, name: "Мозговой штурм", category: "актуализация", description: "Генерация идей за короткое время, без критики.", details: "Учитель задает тему. Ученики по очереди называют любые идеи...", link: "" },
    { base: true, name: "Вопрос к классу", category: "актуализация", description: "Учитель задаёт вопрос по прошлой теме.", details: "Фронтальный опрос...", link: "" },
    { base: true, name: "Кластер", category: "актуализация", description: "Учащиеся записывают ассоциации по теме.", details: "В центре доски пишется ключевое слово...", link: "" },
    { base: true, name: "Работа в малых группах", category: "основной этап", description: "Учащиеся разбиваются на мини-группы.", details: "Класс делится на группы по 3-4 человека...", link: "" },
    { base: true, name: "Обсуждение в парах", category: "основной этап", description: "Двое учащихся обсуждают тему.", details: "Ученики поворачиваются друг к другу...", link: "" },
    { base: true, name: "Кейс-стади", category: "основной этап", description: "Анализ конкретной ситуации.", details: "Учитель раздает группам описание ситуации...", link: "" },
    { base: true, name: "Дебаты", category: "основной этап", description: "Спор по теме с аргументами.", details: "Класс делится на две команды...", link: "" },
    { base: true, name: "Мини-лекция", category: "основной этап", description: "Краткое изложение материала.", details: "Учитель объясняет новую тему 10-15 минут...", link: "" },
    { base: true, name: "Ролевая игра", category: "основной этап", description: "Учащиеся играют роли.", details: "Учитель раздает карточки с ролями...", link: "" },
    { base: true, name: "Решение задач", category: "закрепление", description: "Практическое применение знаний.", details: "Ученики самостоятельно решают задания...", link: "" },
    { base: true, name: "Лови ошибку", category: "закрепление", description: "Ученики ищут ошибку в тексте.", details: "Учитель пишет текст с ошибками...", link: "" },
    { base: true, name: "Презентация учащегося", category: "закрепление", description: "Доклад учащегося по теме.", details: "Ученик готовит выступление на 3-5 минут...", link: "" },
    { base: true, name: "Взаимопроверка", category: "закрепление", description: "Ученики проверяют работы друг друга.", details: "Ученики обмениваются тетрадями...", link: "" },
    { base: true, name: "Зарядка для глаз", category: "физкультминутка", description: "Упражнения для глаз.", details: "Крепко зажмурить глаза, затем открыть...", link: "" },
    { base: true, name: "Разминка на месте", category: "физкультминутка", description: "Наклоны, потягивания, хлопки.", details: "Учитель командует: 'Встали, потянулись...'", link: "" },
    { base: true, name: "Синквейн", category: "рефлексия", description: "Пятистишие по теме урока.", details: "1 строка — 1 существительное...", link: "" },
    { base: true, name: "Незаконченное предложение", category: "рефлексия", description: "Ученики продолжают фразу.", details: "Учитель предлагает фразы: 'Сегодня я узнал...'", link: "" },
    { base: true, name: "Дерево успеха", category: "рефлексия", description: "Ученики отмечают успехи.", details: "На доске рисуется дерево. Ученики клеят стикеры...", link: "" },
    { base: true, name: "Плюс / минус / интересно", category: "рефлексия", description: "Записывают плюсы и минусы.", details: "Таблица из трех колонок...", link: "" },
    { base: true, name: "Светофор", category: "рефлексия", description: "Оценка понимания темы.", details: "Карточки трех цветов...", link: "" }
];

let allTechniques = [];
let lastGenerated = [];
let currentFilter = "all";

// ========== УВЕДОМЛЕНИЯ ==========
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("toast-hide");
        toast.addEventListener("animationend", () => toast.remove());
    }, 3500);
}

// ========== ТЕМА ==========
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("theme", theme);
}

function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved) applyTheme(saved);
    else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? "dark" : "light");
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
}

// ========== ЗАЩИТА И ХРАНЕНИЕ ==========
function saveBackup() {
    try { localStorage.setItem("techniquesBackup", JSON.stringify(allTechniques)); } catch (e) {}
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

function shouldUpdateBase() {
    const currentVersion = localStorage.getItem("baseVersion");
    if (currentVersion !== BASE_VERSION) {
        localStorage.setItem("baseVersion", BASE_VERSION);
        return true;
    }
    return false;
}

// ========== ЗАГРУЗКА ==========
async function loadTechniques() {
    const loader = document.getElementById("loader");
    
    // Мгновенная загрузка из памяти
    const localData = restoreFromBackup();
    if (localData && localData.length > 0) {
        allTechniques = localData;
        updateTechniquesCount();
        if (document.getElementById("all-techniques-container").style.display === "block") displayAllTechniques();
        if (loader) loader.style.display = "none";
    } else {
        if (loader) loader.style.display = "flex";
    }

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Ошибка сети");
        let loaded = await response.json();

        if (!Array.isArray(loaded) || loaded.length === 0) {
            await seedDefaultTechniques();
            return;
        }

        allTechniques = loaded.map((t, i) => ({
            id: t.id || (Date.now() + i),
            name: t.name || "Без названия",
            category: t.category || "основной этап",
            description: t.description || "",
            details: t.details || "",
            link: t.link || "",
            base: t.base === true
        }));

        saveBackup();
        updateTechniquesCount();
        if (document.getElementById("all-techniques-container").style.display === "block") displayAllTechniques();

    } catch (e) {
        console.warn("Ошибка загрузки:", e);
        if (!allTechniques || allTechniques.length === 0) {
            allTechniques = DEFAULT_TECHNIQUES;
            updateTechniquesCount();
            showToast("Ошибка сети. Стандартные приёмы.", "error");
        }
    } finally {
        if (loader) loader.style.display = "none";
    }
}

async function seedDefaultTechniques() {
    for (const t of DEFAULT_TECHNIQUES) {
        await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) });
    }
    const response = await fetch(API_URL);
    allTechniques = await response.json();
    saveBackup();
    updateTechniquesCount();
}

// ========== ГЕНЕРАЦИЯ ==========
function generateLessonStructure() {
    if (allTechniques.length === 0) return showToast("Список приёмов пуст.", "error");

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
        if (fiz.length > 0) selected.splice(2, 0, fiz[Math.floor(Math.random() * fiz.length)]);
    }

    if (selected.length < 3) {
        const rest = allTechniques.filter(t => !usedIds.has(t.id));
        while (selected.length < 3 && rest.length > 0) {
            selected.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
        }
    }

    lastGenerated = selected;
    displayLessonStructure(selected);
    document.getElementById("result-actions").style.display = "flex";
}

// ========== ОТОБРАЖЕНИЕ ==========
function displayLessonStructure(techniques) {
    const container = document.getElementById("lesson-structure-container");
    container.innerHTML = "";
    if (!techniques.length) return;

    const ul = document.createElement("ul");
    techniques.forEach((tech, index) => {
        const li = document.createElement("li");
        
        let detailsHTML = "";
        if (tech.details || tech.link) {
            let linkHTML = tech.link ? `<a href="${tech.link}" target="_blank" class="btn-resource-link">🔗 Полезный материал</a>` : "";
            detailsHTML = `
                <div class="tech-details-block" id="details-${tech.id}">
                    <p>${tech.details || ""}</p>
                    ${linkHTML}
                </div>
            `;
        }

        let toggleBtn = (tech.details || tech.link) 
            ? `<button class="btn-toggle-details" onclick="toggleDetails('${tech.id}', this)">Подробнее ▾</button>` 
            : "";

        li.innerHTML = `
            <span class="category-tag">${capitalize(tech.category)}</span>
            <strong>${index + 1}. ${tech.name}</strong>
            <div>${tech.description || "Нет описания"}</div>
            ${toggleBtn}
            ${detailsHTML}
        `;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

window.toggleDetails = function(id, btn) {
    const block = document.getElementById(`details-${id}`);
    if (block) {
        block.classList.toggle("active");
        btn.textContent = block.classList.contains("active") ? "Скрыть ▴" : "Подробнее ▾";
    }
}

function displayAllTechniques() {
    const container = document.getElementById("all-techniques-container");
    container.style.display = "block";
    container.innerHTML = "";

    let list = allTechniques;
    if (currentFilter !== "all") list = allTechniques.filter(t => t.category === currentFilter);

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
            <div>${tech.description || "Нет описания"}</div>
            <button class="delete-btn" data-id="${tech.id}">Удалить</button>
        `;
        ul.appendChild(li);
    });
    container.appendChild(ul);

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", handleDeleteTechnique);
    });
}

// ========== ДЕЙСТВИЯ ==========
function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function plural(n, forms) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
    return forms[2];
}

function updateTechniquesCount() {
    const el = document.getElementById("techniques-count");
    if (!el) return;
    const total = allTechniques.length;
    el.textContent = `В базе ${total} ${plural(total, ["приём", "приёма", "приёмов"])}`;
    el.classList.remove("updated");
    void el.offsetWidth;
    el.classList.add("updated");
}

function copyStructure() {
    if (!lastGenerated.length) return showToast("Сначала создайте структуру.", "error");
    const text = lastGenerated.map((t, i) => {
        let str = `${i + 1}. [${capitalize(t.category)}] ${t.name} — ${t.description || "без описания"}`;
        if (t.details) str += `\n   Подробнее: ${t.details}`;
        if (t.link) str += `\n   Ссылка: ${t.link}`;
        return str;
    }).join("\n\n");
    navigator.clipboard.writeText(text).then(() => showToast("Скопировано!"));
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
    document.getElementById("all-techniques-container").style.display = "none";
    document.getElementById("close-list-wrapper").style.display = "none";
    document.getElementById("show-all-button").textContent = "Показать все приёмы";
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

async function handleDeleteTechnique(event) {
    const password = prompt("Введите пароль администратора:");
    if (password !== ADMIN_PASSWORD) return showToast("Неверный пароль.", "error");

    const id = event.target.dataset.id;
    const tech = allTechniques.find(t => String(t.id) === String(id));
    if (!tech || !confirm(`Удалить приём «${tech.name}»?`)) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error();
        allTechniques = allTechniques.filter(t => String(t.id) !== String(id));
        saveBackup();
        updateTechniquesCount();
        displayAllTechniques();
        showToast("Приём удалён.");
    } catch (e) {
        showToast("Ошибка удаления.", "error");
    }
}

function toggleAddForm(show) {
    const form = document.getElementById("add-technique-form");
    const btn = document.getElementById("show-add-form-button");
    form.style.display = show ? "block" : "none";
    btn.style.display = show ? "none" : "inline-block";
    if (!show) {
        document.getElementById("technique-name").value = "";
        document.getElementById("technique-description").value = "";
        document.getElementById("technique-details").value = "";
        document.getElementById("technique-link").value = "";
        document.getElementById("technique-category").value = "";
    }
}

async function handleAddTechnique(event) {
    event.preventDefault();
    const name = document.getElementById("technique-name").value.trim();
    const category = document.getElementById("technique-category").value;
    const description = document.getElementById("technique-description").value.trim();
    const details = document.getElementById("technique-details").value.trim();
    const link = document.getElementById("technique-link").value.trim();

    if (!name) return showToast("Введите название.", "error");
    if (!category) return showToast("Выберите категорию.", "error");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, category, description, details, link, base: false })
        });
        if (!response.ok) throw new Error();
        const created = await response.json();
        allTechniques.push(created);
        saveBackup();
        updateTechniquesCount();
        toggleAddForm(false);
        showToast("Приём добавлен!");
        if (document.getElementById("all-techniques-container").style.display === "block") displayAllTechniques();
    } catch (e) {
        showToast("Не удалось сохранить.", "error");
    }
}

function isLowPowerDevice() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    return (cores <= 2 || memory <= 2 || window.innerWidth < 360);
}

// ========== ЗАПУСК ==========
document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
    if (isLowPowerDevice()) document.body.classList.add("reduced-motion");

    await loadTechniques();

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