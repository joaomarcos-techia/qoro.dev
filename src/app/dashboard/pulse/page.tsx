
'use client';

import { redirect } from 'next/navigation';

// This page now simply redirects to a new conversation,
// providing a clean entry point from the main dashboard link.
export default function PulseRedirectPage() {
    redirect('/dashboard/pulse/new');
}
