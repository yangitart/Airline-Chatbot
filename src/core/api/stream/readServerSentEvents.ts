export async function* readServerSentEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let event = "message";
  let data: string[] = [];

  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line) {
          if (data.length) yield { event, data: data.join("\n") };
          event = "message";
          data = [];
          continue;
        }
        const separator = line.indexOf(":");
        const field = separator < 0 ? line : line.slice(0, separator);
        const value = separator < 0 ? "" : line.slice(separator + 1).replace(/^ /, "");
        if (field === "event") event = value || "message";
        if (field === "data") data.push(value);
      }

      if (done) return;
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // A failed stream is already closed.
    } finally {
      reader.releaseLock();
    }
  }
}
