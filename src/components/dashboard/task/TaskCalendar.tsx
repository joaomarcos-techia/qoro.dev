
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { listTasks } from '@/ai/flows/task-management';
import { TaskProfile } from '@/ai/schemas';
import { Loader2, ServerCrash } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
}

const priorityColors: Record<TaskProfile['priority'], { bg: string; border: string }> = {
    low: { bg: '#22C55E', border: '#16A34A' }, // green-500, green-600
    medium: { bg: '#F59E0B', border: '#D97706' }, // amber-500, amber-600
    high: { bg: '#EF4444', border: '#DC2626' }, // red-500, red-600
    urgent: { bg: '#8B5CF6', border: '#7C3AED' }, // violet-500, violet-600
};

export function TaskCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      setError(null);
      listTasks({ actor: currentUser.uid })
        .then((tasks) => {
          const calendarEvents = tasks
            .filter(task => task.dueDate) // Only include tasks with a due date
            .map((task): CalendarEvent => ({
              id: task.id,
              title: task.title,
              start: task.dueDate!,
              allDay: true, // Tasks are treated as all-day events on their due date
              backgroundColor: priorityColors[task.priority]?.bg || priorityColors.medium.bg,
              borderColor: priorityColors[task.priority]?.border || priorityColors.medium.border,
            }));
          setEvents(calendarEvents);
        })
        .catch(err => {
          console.error("Failed to load tasks for calendar:", err);
          setError("Não foi possível carregar as tarefas do calendário.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-gray-600">Carregando calendário...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] bg-red-50 rounded-lg p-8 text-center">
            <ServerCrash className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-red-700">Ocorreu um erro</h3>
            <p className="text-gray-600 mt-2">{error}</p>
        </div>
    );
  }

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        weekends={true}
        events={events}
        locale="pt-br"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        buttonText={{
            today:    'Hoje',
            month:    'Mês',
            week:     'Semana',
            day:      'Dia',
            list:     'Lista'
        }}
        height="auto" // Ensures the calendar fits within its container
        eventDisplay="block"
        eventTimeFormat={{ // Hides the time for all-day events
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false
        }}
      />
    </div>
  );
}
