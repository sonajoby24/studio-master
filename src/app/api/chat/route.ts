import { NextResponse } from 'next/server';

import { runAgent } from '@/lib/ai/agent';

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const {
      message,
      history,
    } = body;

    const response = await runAgent(
      message,
      history || []
    );

    return NextResponse.json({
      response,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        response: 'AI agent failed',
      },
      {
        status: 500,
      }
    );

  }
}