import { createServerFn } from "@tanstack/react-start";

export const translateText = createServerFn({ method: "POST" })
  .inputValidator((data: { text: string; sourceLang: string; targetLang: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { text, sourceLang, targetLang } = data;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the user's text from ${sourceLang} to ${targetLang}. Output ONLY the translation, no explanations, no quotes, no notes. Preserve tone and meaning. If the source is already in ${targetLang}, just return it as-is.`,
          },
          { role: "user", content: text },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error("Rate limit reached. Please wait a moment.");
      if (response.status === 402) throw new Error("AI credits exhausted. Please add credits in Workspace settings.");
      const errText = await response.text();
      console.error("AI gateway error", response.status, errText);
      throw new Error("Translation failed");
    }

    const json = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    return { translation: json.choices[0]?.message?.content?.trim() ?? "" };
  });
