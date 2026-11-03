import { isAxiosError } from "axios";

/** Convert transport failures to safe, domain-neutral error identifiers/messages. */
export function handleError(error: unknown): string {
  if (!isAxiosError(error)) {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error !== null && "message" in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
    return "unexpected_error";
  }

  if (error.code === "ECONNABORTED") return "request_timeout";
  if (!error.response) return "network_error";

  const status = error.response.status;
  const detail = (error.response.data as { detail?: unknown } | undefined)?.detail;
  if (status < 500 && typeof detail === "string") return detail;

  switch (status) {
    case 400:
      return "bad_request";
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    default:
      return status >= 500 ? "server_error" : `http_error_${status}`;
  }
}
