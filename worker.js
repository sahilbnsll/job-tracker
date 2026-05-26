/**
 * Cloudflare Worker — Notion API Proxy
 * Deploy this to Cloudflare Workers (free tier).
 * 
 * Setup:
 *   1. Go to https://dash.cloudflare.com → Workers & Pages → Create
 *   2. Paste this code → Deploy
 *   3. Add environment variable: NOTION_TOKEN = your token (ntn_...)
 *   4. Add environment variable: NOTION_DB_ID = 53bf892d0bc5469baca9827ef5f38470
 *   5. Update ALLOWED_ORIGINS with your GitHub Pages URL
 *   6. Update PROXY in index.html with your worker URL
 */

const ALLOWED_ORIGINS = [
  "https://sahilbnsll.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "null" // for local file:// testing
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // We allow hitting /v1/databases/:id/query and /v1/pages and /v1/pages/:id
    // But we enforce the DB ID to only the one configured in the environment.
    if (!path.startsWith("/v1/databases/") && !path.startsWith("/v1/pages")) {
      return new Response(JSON.stringify({ error: "Forbidden Path" }), {
        status: 403,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": allowedOrigin },
      });
    }
    
    // Inject DB ID if the client sends a request to /v1/pages (create row)
    // Client should just send the properties, worker will inject the parent
    let body = request.body;
    if (request.method === "POST" && path === "/v1/pages") {
        try {
            const reqData = await request.clone().json();
            reqData.parent = { database_id: env.NOTION_DB_ID };
            body = JSON.stringify(reqData);
        } catch (e) {
            // body parse fail, pass through
        }
    }

    try {
      const notionRes = await fetch(`https://api.notion.com${path}`, {
        method: request.method,
        headers: {
          "Authorization": `Bearer ${env.NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: (request.method === "GET" || request.method === "HEAD") ? null : body,
      });

      const data = await notionRes.text();
      return new Response(data, {
        status: notionRes.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": allowedOrigin,
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": allowedOrigin,
        },
      });
    }
  },
};
