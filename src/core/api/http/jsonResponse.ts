import { NextResponse } from "next/server";

export function jsonResponse<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

export function jsonError(detail: string, status: number, errorCode?: string) {
  return jsonResponse(
    {
      detail,
      ...(errorCode ? { error_code: errorCode } : {}),
    },
    { status },
  );
}
