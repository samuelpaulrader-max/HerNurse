// HerNurse — live AI answer endpoint (Netlify Function)
// Returns short, bite-sized chunks for any medical question.
export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let question = "";
  try { const b = await req.json(); question = String(b.question || "").slice(0, 500); } catch {}
  if (!question.trim()) return Response.json({ chunks: [] });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ chunks: ["The AI isn’t configured yet. Add ANTHROPIC_API_KEY in Netlify → Site settings → Environment variables."] });

  const system =
    "You are a women's-health nurse educator for HerNurse. Answer the user's health question in 3 to 5 SHORT, bite-sized chunks of 1-2 sentences each, in plain, warm language. " +
    "Give general health education only — never a diagnosis, never specific personal medical advice, and never prescribe medication or doses. " +
    "If the topic is serious, urgent, or an emergency, say so clearly and advise contacting a clinician or emergency services. " +
    "Return ONLY a JSON array of strings (each string = one chunk), with no other text.";

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 700,
        system,
        messages: [{ role: "user", content: question }]
      })
    });
    const data = await r.json();
    let text = (data && data.content && data.content[0] && data.content[0].text) || "";
    let chunks;
    try { chunks = JSON.parse(text); }
    catch { chunks = text.split(/\n+/).filter(Boolean); }
    if (!Array.isArray(chunks)) chunks = [String(chunks)];
    chunks = chunks.map((c) => String(c).trim()).filter(Boolean).slice(0, 6);
    if (!chunks.length) chunks = ["Sorry — I couldn’t generate an answer just now. Please try rephrasing, or book a consult with a nurse."];
    return Response.json({ chunks });
  } catch (e) {
    return Response.json({ chunks: [] });
  }
};
