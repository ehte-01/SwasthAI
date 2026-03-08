import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { language } = await request.json();
    if (!language) {
      return NextResponse.json({ error: "Language required" }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 503 });
    }

    const today = new Date().toISOString();
    const prompt = `Generate 6 health news articles in ${language} language for Indian audience. For each article use EXACTLY this format:

Title: [article title]
Description: [one line description]
Content: [2-3 sentences]
URL: https://healthnews.example.com/article${Math.floor(Math.random() * 100)}
Source: Health Daily India
Date: ${today}

Repeat for all 6 articles. Start directly with Title:`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'user', content: prompt },
        ],
        max_tokens: 2048,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const news = data.choices?.[0]?.message?.content;

    if (!news) {
      return NextResponse.json({ error: "No response from Groq" }, { status: 500 });
    }

    return NextResponse.json({ news });

  } catch (error: any) {
    console.error("News error:", error);
    return NextResponse.json({ error: "Failed to fetch news: " + error.message }, { status: 500 });
  }
}