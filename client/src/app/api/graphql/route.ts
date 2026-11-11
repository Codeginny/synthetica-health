import { NextResponse, type NextRequest } from 'next/server';
import { graphql } from 'graphql';
import { schema } from '@/server/graphql/schema';
import { rootValue } from '@/server/graphql/resolvers';
import { sessionToken } from '@/server/backend';

interface GraphQLBody {
  query?: unknown;
  variables?: Record<string, unknown>;
  operationName?: string;
}

/** Endpoint GraphQL del BFF. Requiere sesión (cookie httpOnly). */
export async function POST(req: NextRequest) {
  if (!sessionToken()) {
    return NextResponse.json({ errors: [{ message: 'Sesión expirada', extensions: { code: 'UNAUTHENTICATED' } }] }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as GraphQLBody;
  if (typeof body.query !== 'string') {
    return NextResponse.json({ errors: [{ message: 'Falta "query"' }] }, { status: 400 });
  }
  const result = await graphql({
    schema,
    source: body.query,
    rootValue,
    variableValues: body.variables ?? null,
    operationName: body.operationName ?? null,
  });
  return NextResponse.json(result, { status: result.errors && !result.data ? 400 : 200 });
}
