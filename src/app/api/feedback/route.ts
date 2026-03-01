import { NextRequest, NextResponse } from "next/server";
import { mistral } from "@/lib/mistral";
import { MISTRAL_MODEL, FEEDBACK_TEMPERATURE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const { text, systemPrompt } = await request.json();

    if (!text || !systemPrompt) {
      return NextResponse.json(
        { error: "Missing text or systemPrompt" },
        { status: 400 }
      );
    }

    const response = await mistral.chat.complete({
      model: MISTRAL_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Please analyze the following article draft and provide your feedback:\n\n---\n${text}\n---`,
        },
      ],
      responseFormat: { type: "json_object" },
      temperature: FEEDBACK_TEMPERATURE,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Empty response from Mistral" },
        { status: 502 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON response from AI" },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Mistral API error:", error);
    return NextResponse.json(
      { error: "Failed to get feedback from AI" },
      { status: 500 }
    );
  }
}
