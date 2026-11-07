export interface Query {
  page?: number;
  limit?: number;
  ordering?: string;
  search?: string;
  filters?: string;
  fields?: unknown;
}

interface CreateEndpointProps {
  version: number;
  basePath: string;
  queryParams?: Record<
    string,
    string | string[] | number | boolean | null | undefined
  >;
  filters?: string;
  queryFields?: string;
}

export function generateUrlAndQuery({
  basePath,
  version,
  queryParams,
}: CreateEndpointProps): { path: string; query?: string } {
  const query = queryParams ? buildQueryParams(queryParams) : "";
  return {
    path: generateUrl(basePath, version),
    query: query || undefined,
  };
}

/** Build a same-origin Next.js API path. */
export function generateUrl(path: string, version: number): string {
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.replace(/^\/+/, "");
  if (normalizedPath.startsWith("api/")) return `/${normalizedPath}`;
  if (normalizedPath.startsWith(`v${version}/`))
    return `/api/${normalizedPath}`;
  return `/api/v${version}/${normalizedPath}`;
}

export function buildQueryParams(
  params?: Record<string, string | number | boolean | undefined>,
): string {
  if (!params) return "";
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value as string | number | boolean)}`,
    )
    .join("&");
  return query ? `?${query}` : "";
}
