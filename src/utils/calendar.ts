import * as Calendar from 'expo-calendar/legacy';
import { Platform } from 'react-native';
import { DayOfWeek } from '../types';

async function getDefaultCalendarSource() {
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  return defaultCalendar.source;
}

async function getOrCreateCategoryCalendar(catName: string, catColor: string): Promise<string | null> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return null;

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const calName = `LevelUp - ${catName}`;
  const existing = calendars.find(c => c.title === calName);
  if (existing) {
    // If the color changed, we could update it, but keep it simple for now
    return existing.id;
  }

  let source;
  if (Platform.OS === 'ios') {
    source = await getDefaultCalendarSource();
  } else {
    const primaryCal = calendars.find(c => c.isPrimary) || calendars.find(c => c.source.name.includes('@'));
    source = primaryCal?.source;
  }

  if (!source) return calendars.find(c => c.isPrimary)?.id || null;

  try {
    const newCalId = await Calendar.createCalendarAsync({
      title: calName,
      color: catColor,
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: source.id,
      source: source,
      name: calName,
      ownerAccount: source.name,
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
    return newCalId;
  } catch (e) {
    console.error('Errore creazione calendario:', e);
    return calendars.find(c => c.isPrimary)?.id || null; // Fallback to primary
  }
}

export async function createCalendarEvent(title: string, day: DayOfWeek, startTime: string, durationHours: number, catName: string, catColor: string) {
  try {
    const calendarId = await getOrCreateCategoryCalendar(catName, catColor);
    if (!calendarId) return null;

    const now = new Date();
    const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0=Mon, 6=Sun
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
      alarms: [{ relativeOffset: -10 }] // Notify 10 mins before
    });
    return eventId;
  } catch (e) {
    console.error('Errore creazione evento:', e);
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
