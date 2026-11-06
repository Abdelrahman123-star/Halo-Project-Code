import { addDays, buildMonthGrid, isSameMonth, relativeDayLabel } from '../dashboard/calendarMath';

describe('buildMonthGrid', () => {
  it('starts weeks on Monday with leading blanks', () => {
    // 1 November 2026 is a Sunday → six blanks before it.
    const grid = buildMonthGrid(2026, 10);
    expect(grid[0]).toEqual([null, null, null, null, null, null, 1]);
    expect(grid[1][0]).toBe(2);
  });

  it('contains every day exactly once and pads to whole weeks', () => {
    const grid = buildMonthGrid(2024, 1); // February 2024, leap year
    const days = grid.flat().filter((d): d is number => d !== null);
    expect(days).toHaveLength(29);
    expect(days[0]).toBe(1);
    expect(days[28]).toBe(29);
    grid.forEach((week) => expect(week).toHaveLength(7));
  });
});

describe('date helpers', () => {
  const today = new Date(2026, 10, 6); // Fri 6 Nov 2026

  it('labels today, tomorrow and later days', () => {
    expect(relativeDayLabel(today, today)).toBe('Today');
    expect(relativeDayLabel(today, addDays(today, 1))).toBe('Tomorrow');
    expect(relativeDayLabel(today, addDays(today, 7))).toBe('Fri 13');
  });

  it('detects month boundaries', () => {
    expect(isSameMonth(today, addDays(today, 10))).toBe(true);
    expect(isSameMonth(today, addDays(today, 30))).toBe(false);
  });
});
