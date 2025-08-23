
'use client';

// This layout is now simplified as the main sidebar logic is handled 
// by the root DashboardLayout. This file can be further customized
// for Pulse-specific layout needs in the future if necessary.
export default function PulseLayout({ children }: { children: React.ReactNode }) {
  // Removing the parent div with padding allows the chat to be full-screen within the main content area.
  return <>{children}</>;
}
