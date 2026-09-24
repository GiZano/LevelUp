import type { DayOfWeek } from './index';

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
  date.setDate(diff);
  date.setHours(0,0,0,0);
  return date;
}

export function getWeekId(d: Date): string {
  const mon = getMonday(d);
  return `${mon.getFullYear()}-${String(mon.getMonth()+1).padStart(2,'0')}-${String(mon.getDate()).padStart(2,'0')}`;
}

export function getCurrentWeekId(): string {
  return getWeekId(new Date());
}

export function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  return days[new Date().getDay()];
}

export function getDatesOfWeek(weekId: string): Date[] {
  const [y, m, d] = weekId.split('-').map(Number);
  const mon = new Date(y, m - 1, d);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(mon);
    nextDay.setDate(mon.getDate() + i);
    dates.push(nextDay);
  }
  return dates;
}

export function getNextWeekId(weekId: string): string {
  const [y, m, d] = weekId.split('-').map(Number);
  const mon = new Date(y, m - 1, d);
  mon.setDate(mon.getDate() + 7);
  return getWeekId(mon);
}

export function getPrevWeekId(weekId: string): string {
  const [y, m, d] = weekId.split('-').map(Number);
  const mon = new Date(y, m - 1, d);
  mon.setDate(mon.getDate() - 7);
  return getWeekId(mon);
}
