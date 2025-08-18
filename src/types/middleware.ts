import { NextRequest, NextResponse } from 'next/server';

export type Middleware = (request: NextRequest) => Promise<NextResponse | null>;

export interface Controller {
  (request: NextRequest): Promise<NextResponse>;
}
