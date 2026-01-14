import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });
        }

        // As per user requirement, pass request to backend /api/v1/auth/apikeys
        // Wait, the user asked for "app routes and api folder for calling api's".
        // I should proxy ALL calls that the frontend makes.
        // The previous implementation used /api/v1/auth/apikeys in ProfilePage.
        // I need to proxy that too. I'll create `src/app/api/auth/apikeys/route.ts` instead of `apikey` mixed.
        // Or actually, I have `GET` and `POST` in `apikey/route.ts`. 
        // The frontend called:
        // GET /api/v1/auth/apikeys -> I should map this to GET /api/auth/apikeys
        // POST /api/v1/auth/apikey -> I should map this to POST /api/auth/apikey

        // Correct mapping for Next.js App Router conventions:
        // GET /api/auth/apikeys/route.ts -> Backend GET /api/v1/auth/apikeys
        // POST /api/auth/apikey/route.ts -> Backend POST /api/v1/auth/apikey

        // I created `apikey/route.ts` with both GET and POST. 
        // GET there would be `/api/auth/apikey`. 
        // But backend uses plural for GET `apikeys` and singular for POST `apikey`.
        // I should align with backend or update frontend. 
        // Updating frontend is better to clean up.
        // I will use `/api/auth/apikey` for POST and `/api/auth/apikeys` for GET.

        return NextResponse.json({ error: 'Not implemented, use specific routes' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
