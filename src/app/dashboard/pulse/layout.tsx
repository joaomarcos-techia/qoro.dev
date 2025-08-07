
import { auth } from '@/lib/firebase';
import { listConversations } from '@/ai/flows/pulse-flow';
import { Conversation } from '@/ai/schemas';
import { SidebarContent } from './_components/SidebarContent';
import DashboardLayout from '../layout';

export default async function PulseModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = auth.currentUser;
  let conversations: Conversation[] = [];
  let error: string | null = null;

  if (currentUser) {
    try {
      const convos = await listConversations({ actor: currentUser.uid });
      // Sort conversations by most recent
      conversations = [...convos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error("Failed to fetch conversations in Pulse layout:", err);
      // We'll pass the error to the client component to display it there
      error = "Não foi possível carregar o histórico de conversas.";
    }
  } else {
    // This case might happen during server-side rendering before auth state is known
    // The client component will handle showing a login state or re-fetching
    error = "Usuário não autenticado.";
  }

  const sidebarConversations = (
    <SidebarContent 
      initialConversations={conversations} 
      initialError={error}
      actorUid={currentUser?.uid || ''}
    />
  );
  
  return (
    <DashboardLayout pulseConversations={sidebarConversations}>
      {children}
    </DashboardLayout>
  )
}
