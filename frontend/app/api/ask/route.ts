import { NextRequest, NextResponse } from 'next/server';

const HEALTH_SYSTEM_PROMPT = `You are MediBot, an AI Health Assistant for SwasthAI - a healthcare platform for Indian users.

Your role:
- Provide accurate, evidence-based health information
- Help users understand medical conditions in simple terms
- Suggest when to seek professional medical care
- Promote healthy lifestyle choices
- Be empathetic and caring in responses

Important guidelines:
- Always remind users you are not a replacement for professional medical advice
- For emergencies (chest pain, difficulty breathing, severe bleeding), always say "Call 112 immediately"
- Keep responses clear and concise
- LANGUAGE RULE: Detect the script of user's message. If user writes in Devanagari script (Hindi), respond in Hindi. If user writes in Roman/English script (even broken English like "pain in shoulder"), ALWAYS respond in English only. Never use Hinglish.`;

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 503 });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: HEALTH_SYSTEM_PROMPT },
          { role: 'user', content: question },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return NextResponse.json({ error: 'No response from Groq' }, { status: 500 });
    }

    return NextResponse.json({
      response: text,
      source: 'groq-llama-3.1-8b-instant',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error in /api/ask:', error);
    return NextResponse.json(
      { error: 'AI service error: ' + error.message },
      { status: 503 }
    );
  }
}