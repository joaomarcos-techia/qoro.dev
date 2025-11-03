
'use client';

import { TaskCalendar } from '@/components/dashboard/task/TaskCalendar';

export default function CalendarioPage() {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Calendário</h1>
                <p className="text-muted-foreground mt-1">
                Visualize as datas de entrega de tarefas e projetos em um único lugar.
                </p>
            </div>
        </div>
        <div className="bg-card p-4 sm:p-6 rounded-2xl border-border">
            <TaskCalendar />
        </div>
      </div>
    );
  }
