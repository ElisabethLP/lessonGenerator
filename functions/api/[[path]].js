// Cloudflare Pages Function — API для хранения приёмов в KV
// Обрабатывает все запросы по адресу /api/*

export async function onRequest(context) {
    const { request, env, params } = context;
    const method = request.method;
    const pathParts = params.path || [];
    const id = pathParts[0]; // если запрос /api/techniques/123, id = "123"

    // CORS-заголовки на всякий случай (не помешают)
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    // Preflight-запрос от браузера
    if (method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    // ========== GET /api/techniques — получить все приёмы ==========
    if (method === "GET") {
        try {
            const data = await env.TECHNIQUES_KV.get("all", { type: "json" });
            return new Response(JSON.stringify(data || []), {
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }
    }

    // ========== POST /api/techniques — добавить приём ==========
    if (method === "POST") {
        try {
            const newTech = await request.json();
            const data = (await env.TECHNIQUES_KV.get("all", { type: "json" })) || [];

            // Присваиваем уникальный id
            newTech.id = Date.now();
            data.push(newTech);

            await env.TECHNIQUES_KV.put("all", JSON.stringify(data));

            return new Response(JSON.stringify(newTech), {
                status: 201,
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }
    }

    // ========== PUT /api/techniques — перезаписать всё (для инициализации) ==========
    if (method === "PUT") {
        try {
            const newData = await request.json();
            if (!Array.isArray(newData)) {
                return new Response(JSON.stringify({ error: "Ожидается массив" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json", ...corsHeaders }
                });
            }
            await env.TECHNIQUES_KV.put("all", JSON.stringify(newData));
            return new Response(JSON.stringify({ ok: true, count: newData.length }), {
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }
    }

    // ========== DELETE /api/techniques/:id — удалить приём ==========
    if (method === "DELETE" && id) {
        try {
            const data = (await env.TECHNIQUES_KV.get("all", { type: "json" })) || [];
            const filtered = data.filter(t => String(t.id) !== String(id));
            await env.TECHNIQUES_KV.put("all", JSON.stringify(filtered));

            return new Response(JSON.stringify({ ok: true }), {
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }
    }

    // ========== Всё остальное — 404 ==========
    return new Response(JSON.stringify({ error: "Метод не поддерживается" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders }
    });
}
