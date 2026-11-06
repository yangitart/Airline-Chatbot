import "server-only";

import type { ChatCompletionRepository } from "../domain/repositories/ChatCompletionRepository";
import { sendChatMessageUseCase } from "../domain/useCases/sendChatMessageUseCase";
import { ProviderChatCompletionRepository } from "../data/repositories/ProviderChatCompletionRepository";
import { OpenAIChatModelProvider } from "../data/providers/OpenAIChatModelProvider";
import { OpenAIQuestionEmbedder } from "../data/providers/OpenAIQuestionEmbedder";
import { SupabaseFaqRetriever } from "../data/data_sources/SupabaseFaqRetriever";
import { ChatError } from "../domain/models/ChatError";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSearchFlights } from "@/src/features/flights/ioc/serverSearchFlights";
import { createServerBookings } from "@/src/features/bookings/ioc/serverBookings";
import { createServerFlightStatus } from "@/src/features/flights/ioc/serverFlightStatus";
import { executeSearchFlightsTool, searchFlightsToolDefinition } from "../data/tools/searchFlightsTool";
import { createBookingLookupTool, createFlightStatusTool } from "../data/tools/tripLookupTools";

export function createServerTravelAssistant(supabase: SupabaseClient) {
  const openAiKey = process.env.OPENAI_API_KEY ?? "";
  if (!openAiKey.trim()) throw new ChatError("assistant_unavailable");

  const provider = new OpenAIChatModelProvider(openAiKey, process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini");
  const faqRetriever = process.env.FAQ_RAG_ENABLED === "true"
    ? new SupabaseFaqRetriever(
      supabase,
      new OpenAIQuestionEmbedder(openAiKey, process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small"),
    )
    : undefined;

  const searchFlights = createServerSearchFlights(supabase);
  const repository: ChatCompletionRepository = new ProviderChatCompletionRepository(provider, [
    { definition: searchFlightsToolDefinition, execute: (args) => executeSearchFlightsTool(args, searchFlights) },
    createBookingLookupTool(createServerBookings(supabase)),
    createFlightStatusTool(createServerFlightStatus(supabase)),
  ], faqRetriever);
  return sendChatMessageUseCase(repository);
}
