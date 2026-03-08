export async function GET() {
  try {
    const res = await fetch(
      process.env.ML_API_URL + "/health",
      { signal: AbortSignal.timeout(10000) }
    );
    const data = await res.json();
    return Response.json({ status: "ok", ml: data });
  } catch (e) {
    return Response.json(
      { status: "error", message: String(e) },
      { status: 500 }
    );
  }
}