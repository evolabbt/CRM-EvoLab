export async function onRequestGet({ env }) {
  try {
    if (!env.DB) {
      return Response.json(
        { status: "indisponivel" },
        { status: 503 }
      );
    }

    await env.DB.prepare("SELECT 1").first();

    return Response.json({
      status: "ok",
      sistema: "EvoLab CRM"
    });
  } catch {
    return Response.json(
      { status: "indisponivel" },
      { status: 503 }
    );
  }
}
