import "server-only";

import type { ChatCompletionRepository } from "../domain/repositories/ChatCompletionRepository";
import { sendChatMessageUseCase } from "../domain/useCases/sendChatMessageUseCase";
import { ProviderChatCompletionRepository } from "../data/repositories/ProviderChatCompletionRepository";
import { SupabaseFaqRetriever } from "../data/data_sources/SupabaseFaqRetriever";
import { OpenAIChatModelProvider } from "../data/providers/OpenAIChatModelProvider";
import { GroqChatModelProvider } from "../data/providers/GroqChatModelProvider";
import { GeminiChatModelProvider } from "../data/providers/GeminiChatModelProvider";
import type { ChatModelProvider } from "../data/providers/ChatModelProvider";
import { ChatError } from "../domain/models/ChatError";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSearchFlights } from "@/src/features/flights/ioc/serverSearchFlights";
import { createServerBookings } from "@/src/features/bookings/ioc/serverBookings";
import { createServerFlightStatus } from "@/src/features/flights/ioc/serverFlightStatus";
import {
  executeSearchFlightsTool,
  searchFlightsToolDefinition,
} from "../data/tools/searchFlightsTool";
import {
  createBookingLookupTool,
  createFlightStatusTool,
} from "../data/tools/tripLookupTools";

export function createServerTravelAssistant(supabase: SupabaseClient) {
  const provider = createChatModelProvider();
  const faqRetriever =
    process.env.CHAT_FAQ_RAG_ENABLED?.trim().toLowerCase() === "true"
      ? new SupabaseFaqRetriever(supabase, process.env.GEMINI_API_KEY ?? "")
      : undefined;

  const searchFlights = createServerSearchFlights(supabase);
  const repository: ChatCompletionRepository =
    new ProviderChatCompletionRepository(
      provider,
      [
        {
          definition: searchFlightsToolDefinition,
          execute: (args) => executeSearchFlightsTool(args, searchFlights),
        },
        createBookingLookupTool(createServerBookings(supabase)),
        createFlightStatusTool(createServerFlightStatus(supabase)),
      ],
      faqRetriever,
    );
  return sendChatMessageUseCase(repository);
}

function createChatModelProvider(): ChatModelProvider {
  const selectedProvider = (process.env.CHAT_AI_PROVIDER ?? "gemini")
    .trim()
    .toLowerCase();

  switch (selectedProvider) {
    case "groq": {
      const apiKey = process.env.GROQ_API_KEY ?? "";
      if (!apiKey.trim()) throw new ChatError("assistant_unavailable");
      return new GroqChatModelProvider(
        apiKey,
        process.env.GROQ_CHAT_MODEL ?? "openai/gpt-oss-120b",
      );
    }
    case "openai": {
      const apiKey = process.env.OPENAI_API_KEY ?? "";
      if (!apiKey.trim()) throw new ChatError("assistant_unavailable");
      return new OpenAIChatModelProvider(
        apiKey,
        process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
      );
    }
    case "gemini": {
      const apiKey = process.env.GEMINI_API_KEY ?? "";
      if (!apiKey.trim()) throw new ChatError("assistant_unavailable");
      return new GeminiChatModelProvider(
        apiKey,
        process.env.GEMINI_CHAT_MODEL ?? "gemini-3.5-flash",
      );
    }
    default:
      throw new ChatError("assistant_unavailable");
  }
}
