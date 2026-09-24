import * as Calendar from 'expo-calendar/legacy';
import { Platform } from 'react-native';
import { DayOfWeek } from '../types';

async function getDefaultCalendarSource() {
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  return defaultCalendar.source;
}

export async function createCalendarEvent(title: string, day: DayOfWeek, startTime: string, durationHours: number) {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    let calendarId = calendars.find(c => c.isPrimary)?.id;

    if (!calendarId && Platform.OS === 'ios') {
      const defaultCalendarSource = await getDefaultCalendarSource();
      const newCalendarID = await Calendar.createCalendarAsync({
        title: 'LevelUp Planner',
        color: 'blue',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource.id,
        source: defaultCalendarSource,
        name: 'internalCalendarName',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });
      calendarId = newCalendarID;
    }

    if (!calendarId) return;

    // Calcola la data e l'ora
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0=Lun, 6=Dom
    const targetDays = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];
    const targetDayIdx = targetDays.indexOf(day);
    
    const diff = targetDayIdx - currentDay;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + diff);

    const [hh, mm] = startTime.split(':').map(Number);
    targetDate.setHours(hh, mm, 0, 0);

    const endDate = new Date(targetDate);
    const durationMs = durationHours * 60 * 60 * 1000;
    endDate.setTime(targetDate.getTime() + durationMs);

    const eventId = await Calendar.createEventAsync(calendarId, {
      title,
      startDate: targetDate,
      endDate,
      timeZone: 'Europe/Rome',
      alarms: [{ relativeOffset: -10 }] // Notifica 10 min prima
    });
    return eventId;
  } catch (e) {
    console.error('Errore calendario:', e);
    return null;
  }
}

export async function deleteCalendarEvent(eventId: string) {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') return;
    await Calendar.deleteEventAsync(eventId);
  } catch (e) {
    console.error('Errore cancellazione calendario:', e);
  }
}
