
'use client';
import type { Metadata } from 'next';
import { TaskCalendar } from '@/components/dashboard/task/TaskCalendar';

// This metadata is not used in client components but is good practice.
// export const metadata: Metadata = {
//   title: 'QoroTask | Calendário',
// };

export default function CalendarioPage() {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-4xl font-bold text-foreground">Calendário</h1>
                <p className="text-muted-foreground">
                Visualize as datas de entrega de tarefas e projetos em um único lugar.
                </p>
            </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border-border">
            <TaskCalendar />
        </div>
      </div>
    );
  }
