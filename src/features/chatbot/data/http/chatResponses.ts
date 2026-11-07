import "server-only";

import { ChatError, chatErrorStatus } from "../../domain/models/ChatError";

export function chatFailure(error: unknown, operation: string) {
  const failure =
    error instanceof ChatError
      ? error
      : new ChatError(
          error instanceof Error && error.name === "TimeoutError"
            ? "provider_timeout"
            : "unexpected_error",
          error,
        );
  const status = chatErrorStatus[failure.code];
  if (status >= 500) console.error("[chat]", { operation, code: failure.code });
  return { status, body: { error: failure.code } };
}

export async function chatResponse(
  operation: string,
  run: () => Promise<Response>,
) {
  try {
    return await run();
  } catch (error) {
    const { status, body } = chatFailure(error, operation);
    return Response.json(body, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  }
}

export function chatEventStream(
  events: AsyncGenerator<{ event: string; data: unknown }>,
  cancellation: AbortController,
  signal: AbortSignal,
) {
  const encoder = new TextEncoder();
  const encode = (event: string, data: unknown) =>
    encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  return new Response(
    new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const next = await events.next();
          if (signal.aborted) {
            if (!cancellation.signal.aborted) controller.close();
            return;
          }
          if (next.done) controller.close();
          else controller.enqueue(encode(next.value.event, next.value.data));
        } catch (error) {
          if (signal.aborted) {
            if (!cancellation.signal.aborted) controller.close();
            return;
          }
          controller.enqueue(
            encode("error", chatFailure(error, "stream_message").body),
          );
          controller.close();
        }
      },
      async cancel() {
        cancellation.abort();
        await events.return(undefined);
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
      },
    },
  );
}
