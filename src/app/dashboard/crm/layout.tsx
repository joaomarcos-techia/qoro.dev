
'use client';

// This layout is now simplified as the main sidebar logic is handled 
// by the root DashboardLayout. This file can be further customized
// for CRM-specific layout needs in the future if necessary.
export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
