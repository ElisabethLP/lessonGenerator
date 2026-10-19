// ========== НАСТРОЙКИ ==========
var API_URL = "https://6acb9b2eef37b1504078101f.mockapi.io/techniques";
var ADMIN_PASSWORD = "88888888";
var BASE_VERSION = "1.3";

// ========== БАЗОВЫЕ ПРИЁМЫ ==========
var DEFAULT_TECHNIQUES = [
    { base: true, name: "Мозговой штурм", category: "актуализация", description: "Генерация идей за короткое время, без критики.", details: "Учитель задает тему. Ученики по очереди называют любые идеи...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Вопрос к классу", category: "актуализация", description: "Учитель задаёт вопрос по прошлой теме.", details: "Фронтальный опрос...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Кластер", category: "актуализация", description: "Учащиеся записывают ассоциации по теме.", details: "В центре доски пишется ключевое слово...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Работа в малых группах", category: "основной этап", description: "Учащиеся разбиваются на мини-группы.", details: "Класс делится на группы по 3-4 человека...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Обсуждение в парах", category: "основной этап", description: "Двое учащихся обсуждают тему.", details: "Ученики поворачиваются друг к другу...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Кейс-стади", category: "основной этап", description: "Анализ конкретной ситуации.", details: "Учитель раздает группам описание ситуации...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Дебаты", category: "основной этап", description: "Спор по теме с аргументами.", details: "Класс делится на две команды...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Мини-лекция", category: "основной этап", description: "Краткое изложение материала.", details: "Учитель объясняет новую тему 10-15 минут...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Ролевая игра", category: "основной этап", description: "Учащиеся играют роли.", details: "Учитель раздает карточки с ролями...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Решение задач", category: "закрепление", description: "Практическое применение знаний.", details: "Ученики самостоятельно решают задания...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Лови ошибку", category: "закрепление", description: "Ученики ищут ошибку в тексте.", details: "Учитель пишет текст с ошибками...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Презентация учащегося", category: "закрепление", description: "Доклад учащегося по теме.", details: "Ученик готовит выступление на 3-5 минут...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Взаимопроверка", category: "закрепление", description: "Ученики проверяют работы друг друга.", details: "Ученики обмениваются тетрадями...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Зарядка для глаз", category: "физкультминутка", description: "Упражнения для глаз.", details: "Крепко зажмурить глаза, затем открыть...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Разминка на месте", category: "физкультминутка", description: "Наклоны, потягивания, хлопки.", details: "Учитель командует: 'Встали, потянулись...'", link: "", rating: 0, votes: 0 },
    { base: true, name: "Синквейн", category: "рефлексия", description: "Пятистишие по теме урока.", details: "1 строка — 1 существительное...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Незаконченное предложение", category: "рефлексия", description: "Ученики продолжают фразу.", details: "Учитель предлагает фразы: 'Сегодня я узнал...'", link: "", rating: 0, votes: 0 },
    { base: true, name: "Дерево успеха", category: "рефлексия", description: "Ученики отмечают успехи.", details: "На доске рисуется дерево. Ученики клеят стикеры...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Плюс / минус / интересно", category: "рефлексия", description: "Записывают плюсы и минусы.", details: "Таблица из трех колонок...", link: "", rating: 0, votes: 0 },
    { base: true, name: "Светофор", category: "рефлексия", description: "Оценка понимания темы.", details: "Карточки трех цветов...", link: "", rating: 0, votes: 0 }
];

var allTechniques = [];
var lastGenerated = [];
var currentFilter = "all";
var sortByRating = false;

// ========== УВЕДОМЛЕНИЯ ==========
function showToast(message, type) {
    var container = document.getElementById("toast-container");
    if (!container) return;
    var toast = document.createElement("div");
    toast.className = "toast toast-" + (type || "success");
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () {
        toast.classList.add("toast-hide");
        toast.addEventListener("animationend", function () { toast.remove(); });
    }, 3500);
}

// ========== ТЕМА ==========
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("theme", theme);
}

function initTheme() {
    var saved = localStorage.getItem("theme");
    if (saved) applyTheme(saved);
    else {
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? "dark" : "light");
    }
}

function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
}

// ========== ЗАЩИТА И ХРАНЕНИЕ ==========
function saveBackup() {
    try { localStorage.setItem("techniquesBackup", JSON.stringify(allTechniques)); } catch (e) {}
}

function restoreFromBackup() {
    try {
        var saved = localStorage.getItem("techniquesBackup");
        if (saved) {
            var parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {}
    return null;
}

// ========== ЗАГРУЗКА (СНАЧАЛА ИЗ ПАМЯТИ, ПОТОМ ИЗ СЕТИ) ==========
async function loadTechniques() {
    var loader = document.getElementById("loader");
    
    // 1. МГНОВЕННАЯ ЗАГРУЗКА ИЗ ПАМЯТИ ТЕЛЕФОНА
    var localData = restoreFromBackup();
    if (localData && localData.length > 0) {
        allTechniques = localData;
        updateTechniquesCount();
        // Если список приёмов открыт, обновляем его
        if (document.getElementById("all-techniques-container").style.display === "block") {
            displayAllTechniques();
        }
        if (loader) loader.style.display = "none"; // Прячем спиннер, данные уже есть
    } else {
        if (loader) loader.style.display = "flex"; // Показываем спиннер, если памяти нет
    }

    // 2. ТИХОЕ ОБНОВЛЕНИЕ ИЗ СЕТИ В ФОНЕ
    try {
        // Добавляем тайм-аут 4 секунды, чтобы не ждать вечно
        var controller = new AbortController();
        var timeoutId = setTimeout(function() { controller.abort(); }, 4000);

        var response = await fetch(API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Сервер занят или лимит запросов");

        var loaded = await response.json();

        if (Array.isArray(loaded) && loaded.length > 0) {
            // Обновляем данные
            allTechniques = loaded.map(function(t, i) {
                return {
                    id: t.id || (Date.now() + i),
                    name: t.name || "Без названия",
                    category: t.category || "основной этап",
                    description: t.description || "",
                    details: t.details || "",
                    link: t.link || "",
                    base: t.base === true,
                    rating: Number(t.rating) || 0,
                    votes: Number(t.votes) || 0
                };
            });

            saveBackup(); // Сохраняем свежую копию в память
            updateTechniquesCount();
            
            if (document.getElementById("all-techniques-container").style.display === "block") {
                displayAllTechniques();
            }
        }
    } catch (e) {
        console.warn("Фоновое обновление не удалось (лимит MockAPI или нет сети). Работаем из памяти.");
        // Если памяти не было и сеть упала — грузим стандартные приёмы
        if (!allTechniques || allTechniques.length === 0) {
            allTechniques = DEFAULT_TECHNIQUES.map(function(t, i) {
                return { id: Date.now() + i, base: true, name: t.name, category: t.category, description: t.description, details: t.details, link: t.link, rating: 0, votes: 0 };
            });
            updateTechniquesCount();
            showToast("Нет сети. Загружены стандартные приёмы.", "error");
        }
    } finally {
        if (loader) loader.style.display = "none";
    }
}
// ========== ГЕНЕРАЦИЯ ==========
function getWeightedRandomTechnique(pool) {
    var getWeight = function(tech) {
        var effectiveRating = (tech.votes || 0) < 3 ? 2.5 : (tech.rating || 0);
        return Math.pow(effectiveRating + 1, 2);
    };
    var totalWeight = pool.reduce(function(sum, tech) { return sum + getWeight(tech); }, 0);
    var random = Math.random() * totalWeight;
    for (var i = 0; i < pool.length; i++) {
        var weight = getWeight(pool[i]);
        if (random < weight) return pool[i];
        random -= weight;
    }
    return pool[0];
}

function generateLessonStructure() {
    if (allTechniques.length === 0) return showToast("Список приёмов пуст.", "error");
    var categories = ["актуализация", "основной этап", "закрепление", "рефлексия"];
    var selected = [];
    var usedIds = new Set();

    categories.forEach(function(cat) {
        var pool = allTechniques.filter(function(t) { return t.category === cat && !usedIds.has(t.id); });
        if (pool.length > 0) {
            var pick = getWeightedRandomTechnique(pool);
            selected.push(pick);
            usedIds.add(pick.id);
        }
    });

    if (Math.random() < 0.5) {
        var fiz = allTechniques.filter(function(t) { return t.category === "физкультминутка" && !usedIds.has(t.id); });
        if (fiz.length > 0) selected.splice(2, 0, getWeightedRandomTechnique(fiz));
    }
    if (selected.length < 3) {
        var rest = allTechniques.filter(function(t) { return !usedIds.has(t.id); });
        while (selected.length < 3 && rest.length > 0) selected.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
    }

    lastGenerated = selected;
    displayLessonStructure(selected);
    document.getElementById("result-actions").style.display = "flex";
}

// ========== ОТОБРАЖЕНИЕ ==========
function displayLessonStructure(techniques) {
    var container = document.getElementById("lesson-structure-container");
    container.innerHTML = "";
    if (!techniques.length) return;

    var ul = document.createElement("ul");
    techniques.forEach(function(tech, index) {
        var li = document.createElement("li");
        var detailsHTML = "";
        if (tech.details || tech.link) {
            var linkHTML = tech.link ? '<a href="' + tech.link + '" target="_blank" class="btn-resource-link">🔗 Полезный материал</a>' : "";
            detailsHTML = '<div class="tech-details-block" id="details-' + tech.id + '"><p>' + (tech.details || "") + '</p>' + linkHTML + '</div>';
        }
        var toggleBtn = (tech.details || tech.link) ? '<button class="btn-toggle-details" onclick="toggleDetails(\'' + tech.id + '\', this)">Подробнее ▾</button>' : "";
        li.innerHTML = '<span class="category-tag">' + capitalize(tech.category) + '</span><strong>' + (index + 1) + '. ' + tech.name + '</strong><div>' + (tech.description || "Нет описания") + '</div>' + toggleBtn + detailsHTML;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

window.toggleDetails = function(id, btn) {
    var block = document.getElementById("details-" + id);
    if (block) {
        block.classList.toggle("active");
        btn.textContent = block.classList.contains("active") ? "Скрыть ▴" : "Подробнее ▾";
    }
}

function displayAllTechniques() {
    var container = document.getElementById("all-techniques-container");
    if (!container) return;
    container.style.display = "block";
    container.innerHTML = "";

    var list = allTechniques;
    if (currentFilter !== "all") list = allTechniques.filter(function(t) { return t.category === currentFilter; });
    if (sortByRating) list.sort(function(a, b) { return (b.rating || 0) - (a.rating || 0); });

    if (list.length === 0) {
        container.innerHTML = "<p>В этой категории пока нет приёмов.</p>";
        return;
    }

    var ul = document.createElement("ul");
    list.forEach(function(tech) {
        var li = document.createElement("li");
        var ratingHTML = (tech.votes > 0) ? '<span class="rating-badge">★ ' + tech.rating.toFixed(1) + '</span>' : '<span class="rating-badge" style="opacity:0.6">Пока нет оценок</span>';
        
        li.innerHTML = 
            '<div class="tech-header">' +
                '<div class="tech-title"><span class="category-tag">' + capitalize(tech.category) + '</span><strong>' + tech.name + '</strong>' + ratingHTML + '</div>' +
                '<div class="tech-actions"><button class="delete-btn" data-id="' + tech.id + '">✕ Удалить</button></div>' +
            '</div>' +
            '<div>' + (tech.description || "Нет описания") + '</div>' +
            '<div class="stars" data-id="' + tech.id + '">' +
                '<span class="star" data-score="1">★</span><span class="star" data-score="2">★</span><span class="star" data-score="3">★</span><span class="star" data-score="4">★</span><span class="star" data-score="5">★</span>' +
            '</div>';
        
        ul.appendChild(li);

        var starsContainer = li.querySelector('.stars');
        var stars = starsContainer.querySelectorAll('.star');
        var voted = JSON.parse(localStorage.getItem('voted') || '{}');

        if (voted[tech.id]) {
            starsContainer.style.opacity = '0.5';
            starsContainer.title = "Вы уже оценили этот приём";
        } else {
            stars.forEach(function(star, index) {
                star.addEventListener('mouseenter', function() {
                    stars.forEach(function(s, i) { s.classList.toggle('hovered', i <= index); });
                });
                star.addEventListener('click', function(e) {
                    e.stopPropagation();
                    rateTechnique(tech.id, Number(star.dataset.score));
                });
            });
            starsContainer.addEventListener('mouseleave', function() { stars.forEach(function(s) { s.classList.remove('hovered'); }); });
        }
    });

    container.appendChild(ul);
    document.querySelectorAll(".delete-btn").forEach(function(btn) { btn.addEventListener("click", handleDeleteTechnique); });
}

// ========== ДЕЙСТВИЯ И РЕЙТИНГ ==========
async function rateTechnique(id, score) {
    var voted = JSON.parse(localStorage.getItem('voted') || '{}');
    if (voted[id]) return showToast("Вы уже оценили этот приём!", "error");
    var tech = allTechniques.find(function(t) { return String(t.id) === String(id); });
    if (!tech) return;

    var currentRating = tech.rating || 0;
    var currentVotes = tech.votes || 0;
    var newVotes = currentVotes + 1;
    var newRating = ((currentRating * currentVotes) + score) / newVotes;

    try {
        await fetch(API_URL + "/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rating: newRating, votes: newVotes })
        });
        tech.rating = newRating;
        tech.votes = newVotes;
        voted[id] = true;
        localStorage.setItem('voted', JSON.stringify(voted));
        saveBackup();
        showToast("Спасибо за оценку!");
        displayAllTechniques();
    } catch (e) {
        showToast("Не удалось сохранить оценку", "error");
    }
}

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function plural(n, forms) {
    var mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
    return forms[2];
}

function updateTechniquesCount() {
    var el = document.getElementById("techniques-count");
    if (!el) return;
    var total = allTechniques.length;
    el.textContent = "В базе " + total + " " + plural(total, ["приём", "приёма", "приёмов"]);
}

function copyStructure() {
    if (!lastGenerated.length) return showToast("Сначала создайте структуру.", "error");
    var text = lastGenerated.map(function(t, i) {
        var str = (i + 1) + ". [" + capitalize(t.category) + "] " + t.name + " — " + (t.description || "без описания");
        if (t.details) str += "\n   Подробнее: " + t.details;
        if (t.link) str += "\n   Ссылка: " + t.link;
        return str;
    }).join("\n\n");
    navigator.clipboard.writeText(text).then(function() { showToast("Скопировано!"); });
}

function toggleAllTechniques() {
    var container = document.getElementById("all-techniques-container");
    var mainBtn = document.getElementById("show-all-button");
    var closeWrapper = document.getElementById("close-list-wrapper");
    if (container.style.display === "block") {
        container.style.display = "none"; closeWrapper.style.display = "none"; mainBtn.textContent = "Показать все приёмы";
    } else {
        displayAllTechniques(); closeWrapper.style.display = "block"; mainBtn.textContent = "Скрыть список";
    }
}

function hideAllTechniques() {
    document.getElementById("all-techniques-container").style.display = "none";
    document.getElementById("close-list-wrapper").style.display = "none";
    document.getElementById("show-all-button").textContent = "Показать все приёмы";
}

function setFilter(category) {
    currentFilter = category;
    sortByRating = false;
    document.getElementById("sort-by-rating").classList.remove("active");
    document.querySelectorAll(".filter-btn").forEach(function(btn) {
        if(btn.id !== "sort-by-rating") btn.classList.toggle("active", btn.dataset.category === category);
    });
    if (document.getElementById("all-techniques-container").style.display === "block") displayAllTechniques();
}

function toggleSort() {
    sortByRating = !sortByRating;
    document.getElementById("sort-by-rating").classList.toggle("active", sortByRating);
    if (document.getElementById("all-techniques-container").style.display === "block") displayAllTechniques();
}

async function handleDeleteTechnique(event) {
    var password = prompt("Введите пароль администратора:");
    if (password !== ADMIN_PASSWORD) return showToast("Неверный пароль.", "error");
    var id = event.target.dataset.id;
    var tech = allTechniques.find(function(t) { return String(t.id) === String(id); });
    if (!tech || !confirm("Удалить приём «" + tech.name + "»?")) return;
    try {
        await fetch(API_URL + "/" + id, { method: "DELETE" });
        allTechniques = allTechniques.filter(function(t) { return String(t.id) !== String(id); });
        updateTechniquesCount(); displayAllTechniques(); showToast("Приём удалён.");
    } catch (e) { showToast("Ошибка удаления.", "error"); }
}

function toggleAddForm(show) {
    var form = document.getElementById("add-technique-form");
    var btn = document.getElementById("show-add-form-button");
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
    var name = document.getElementById("technique-name").value.trim();
    var category = document.getElementById("technique-category").value;
    var description = document.getElementById("technique-description").value.trim();
    var details = document.getElementById("technique-details").value.trim();
    var link = document.getElementById("technique-link").value.trim();

    if (!name) return showToast("Введите название.", "error");
    if (!category) return showToast("Выберите категорию.", "error");

    try {
        var response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, category: category, description: description, details: details, link: link, base: false, rating: 0, votes: 0 })
        });
        if (!response.ok) throw new Error("Ошибка");
        var created = await response.json();
        allTechniques.push(created);
        saveBackup(); updateTechniquesCount(); toggleAddForm(false); showToast("Приём добавлен!");
        if (document.getElementById("all-techniques-container").style.display === "block") displayAllTechniques();
    } catch (e) { showToast("Не удалось сохранить.", "error"); }
}

// ========== ЗАПУСК ==========
document.addEventListener("DOMContentLoaded", function() {
    initTheme();
    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

    loadTechniques().then(function() {
        document.getElementById("generate-button").addEventListener("click", generateLessonStructure);
        document.getElementById("regenerate-button").addEventListener("click", generateLessonStructure);
        document.getElementById("copy-button").addEventListener("click", copyStructure);
        document.getElementById("show-all-button").addEventListener("click", toggleAllTechniques);
        document.getElementById("hide-all-button").addEventListener("click", hideAllTechniques);
        document.getElementById("show-add-form-button").addEventListener("click", function() { toggleAddForm(true); });
        document.getElementById("cancel-add-button").addEventListener("click", function() { toggleAddForm(false); });
        document.getElementById("add-technique-form").addEventListener("submit", handleAddTechnique);
        document.getElementById("sort-by-rating").addEventListener("click", toggleSort);

        document.querySelectorAll(".filter-btn").forEach(function(btn) {
            if (btn.id !== "sort-by-rating") {
                btn.addEventListener("click", function() { setFilter(btn.dataset.category); });
            }
        });
    });
});