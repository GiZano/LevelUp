import * as Calendar from 'expo-calendar/legacy';
import { Platform } from 'react-native';
import { DayOfWeek, TimeSlot } from '../types';

async function getDefaultCalendarSource() {
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  return defaultCalendar.source;
}

export async function createCalendarEvent(title: string, day: DayOfWeek, timeSlot: TimeSlot, durationHours: number, offsetHours: number = 0) {
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

    let baseHour = 9; // mattina
    if (timeSlot === 'pomeriggio') baseHour = 14;
    else if (timeSlot === 'sera') baseHour = 20;

    // Aggiungi l'offset dei blocchi precedenti nello stesso slot
    const finalStartHour = baseHour + offsetHours;
    const finalStartMinutes = (finalStartHour % 1) * 60; // Supporta mezz'ore (es. 1.5h)
    
    targetDate.setHours(Math.floor(finalStartHour), finalStartMinutes, 0, 0);

    const endDate = new Date(targetDate);
    const finalEndHour = finalStartHour + durationHours;
    const finalEndMinutes = (finalEndHour % 1) * 60;
    endDate.setHours(Math.floor(finalEndHour), finalEndMinutes, 0, 0);

    await Calendar.createEventAsync(calendarId, {
      title,
      startDate: targetDate,
      endDate,
      timeZone: 'Europe/Rome',
      alarms: [{ relativeOffset: -10 }] // Notifica 10 min prima
    });
  } catch (e) {
    console.error('Errore calendario:', e);
  }
}
