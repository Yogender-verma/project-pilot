import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    const mockResponseBody = `Here is a modern implementation for your request: "${lastUserMessage}":

\`\`\`typescript
import { useState, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(\`Error \${response.status}\`);
        const json = await response.json();
        if (isMounted) setState({ data: json, loading: false, error: null });
      } catch (err) {
        if (isMounted) setState({ data: null, loading: false, error: err as Error });
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, [url]);

  return state;
}
\`\`\`

### Key Implementation Details:
1. **Generics (\`<T>\`):** Strongly types the API response.
2. **Safe Unmounting:** Prevents React state update memory leaks using \`isMounted\`.
`;

    return new Response(mockResponseBody, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
