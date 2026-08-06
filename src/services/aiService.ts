import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const defaultModel = process.env.OPENAI_MODEL || "gpt-4o";

export interface ResponsesOptions {
  model?: string;
  responseFormat?: "json_object" | "text";
  temperature?: number;
}

/**
 * Generic wrapper for OpenAI Responses API.
 * Centralizes the API request logic, error handling, and parameter defaults.
 *
 * @param input Array of input objects (system, user, assistant)
 * @param options Optional parameters to override defaults
 * @returns The raw string response content from the assistant
 */
export const callOpenAIResponses = async (
  input: any[],
  options: ResponsesOptions = {}
): Promise<string> => {
  const {
    model = defaultModel,
    responseFormat = "text",
    temperature = 0.1,
  } = options;

  try {
    const response = await (openai.responses as any).create({
      model,
      input,
      ...(responseFormat === "json_object" ? { text: { format: { type: "json_object" } } } : {}),
      temperature,
    } as any); // Type cast to any in case of typing mismatches with new SDK versions

    return response.output_text || "";
  } catch (error: any) {
    console.error("OpenAI API request failed:", error);
    throw error;
  }
};

/**
 * Extracts structured JSON data from a document or image.
 * Uses the common OpenAI API request wrapper.
 *
 * @param fileBase64 Base64 string of the PDF or image
 * @param systemPrompt The instructions describing what and how to extract
 * @returns The parsed JSON object and the raw output string
 */
export const extractStructuredDataFromDocument = async (
  fileBase64: string,
  systemPrompt: string
): Promise<{ data: any; rawOutput: string }> => {
  try {
    const input = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Please extract the information from this document according to the instructions.",
          },
          {
            type: "input_file",
            file_data: fileBase64.startsWith("data:")
              ? fileBase64
              : `data:application/pdf;base64,${fileBase64}`,
            filename: "document.pdf",
          },
        ],
      },
    ];

    const rawOutput = await callOpenAIResponses(input, {
      responseFormat: "json_object",
      temperature: 0.1,
    });

    const parsedData = JSON.parse(rawOutput || "{}");

    return {
      data: parsedData,
      rawOutput,
    };
  } catch (error: any) {
    console.error("Error in extractStructuredDataFromDocument:", error);
    throw error;
  }
};
