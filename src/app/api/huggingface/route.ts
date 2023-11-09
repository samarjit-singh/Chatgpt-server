import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import { HuggingFaceStream, StreamingTextResponse } from "ai";
import { experimental_buildOpenAssistantPrompt } from "ai/prompts";

const Hf = new HfInference(process.env.TOKEN);

export const runtime = "edge";

export async function POST(req: Request) {
  const apiUrl =
    "https://api-inference.huggingface.co/models/OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5";

  const { messages } = await req.json();

  try {
    const response = await Hf.textGenerationStream({
      model: apiUrl,
      inputs: experimental_buildOpenAssistantPrompt(messages),
      parameters: {
        max_new_tokens: 200,
        // @ts-ignore (this is a valid parameter specifically in OpenAssistant models)
        typical_p: 0.2,
        repetition_penalty: 1,
        truncate: 1000,
        return_full_text: false,
      },
    });

    const stream = HuggingFaceStream(response);

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}
