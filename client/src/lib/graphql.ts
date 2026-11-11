import { api, ApiError, toApiError } from './http';

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string; extensions?: { code?: string } }[];
}

/** Cliente GraphQL mínimo sobre axios: tipado por operación y errores normalizados a ApiError. */
export async function gql<T>(query: string, variables?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  let res: GraphQLResponse<T>;
  try {
    res = (await api.post<GraphQLResponse<T>>('/graphql', { query, variables }, signal ? { signal } : {})).data;
  } catch (err) {
    const e = toApiError(err);
    const gqlMessage = (err as { response?: { data?: GraphQLResponse<T> } }).response?.data?.errors?.[0]?.message;
    throw gqlMessage ? new ApiError(gqlMessage, e.status) : e;
  }
  if (res.errors?.length || !res.data) throw new ApiError(res.errors?.[0]?.message ?? 'Respuesta GraphQL vacía', 400);
  return res.data;
}
