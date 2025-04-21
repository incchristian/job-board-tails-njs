import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing in .env");
      console.log("Environment variables loaded:", Object.keys(process.env).filter(key => key.startsWith("OPENAI_") || key.startsWith("NEXT_PUBLIC_")));
      return NextResponse.json({ error: "OpenAI API key is missing on the server." }, { status: 500 });
    }

    console.log("Making request to OpenAI with API Key:", `${apiKey.slice(0, 5)}...${apiKey.slice(-5)}`);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: body.inputs.split("\nThe Gigster:")[0] },
          ...body.inputs
            .split("\n")
            .filter((line: string) => line.startsWith("User:") || line.startsWith("The Gigster:"))
            .map((line: string) => {
              const [role, ...content] = line.split(": ");
              return {
                role: role === "User" ? "user" : "assistant",
                content: content.join(": "),
              };
            }),
        ],
        temperature: 0.7,
        max_tokens: 150, // Increased to allow longer responses
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json([{ generated_text: response.data.choices[0].message.content }]);
  } catch (error) {
    console.error("Error in /api/huggingface:", error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data?.error || error.message }, { status: 500 });
  }
}