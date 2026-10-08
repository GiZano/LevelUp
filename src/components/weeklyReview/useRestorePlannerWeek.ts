import { useEffect, useRef } from 'react';

export default function useRestorePlannerWeek(
  currentWeekId: string,
  changeWeek: (weekId: string) => void
): void {
  const initialWeekId = useRef(currentWeekId);
  const latestWeekId = useRef(currentWeekId);

  useEffect(() => {
    latestWeekId.current = currentWeekId;
  }, [currentWeekId]);

  useEffect(
    () => () => {
      if (latestWeekId.current !== initialWeekId.current) changeWeek(initialWeekId.current);
    },
    [changeWeek]
  );
}
