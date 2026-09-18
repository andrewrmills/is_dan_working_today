# Dan's Roster App

A simple static web app to instantly see whether Dan is working on any given day.

## What it does

- Shows a prominent banner answering **"Is Dan working today?"** with a green/red background and emoji.
- Displays a monthly calendar with every day colour-coded as Work (red 😢) or Off (green 🍺).
- Lets you jump to any date — the calendar navigates to that month and highlights the week.
- Click any day to see its full date, work/off status, and cycle day number.
- Highlights today clearly in the calendar.
- Fully responsive — works on mobile and desktop.

## The rotating cycle

The schedule follows an endlessly repeating 14-day cycle made up of these blocks:

| Cycle day | Status |
|-----------|--------|
| 1         | Work   |
| 2         | Work   |
| 3         | Work   |
| 4         | Off    |
| 5         | Off    |
| 6         | Work   |
| 7         | Work   |
| 8         | Work   |
| 9         | Off    |
| 10        | Off    |
| 11        | Work   |
| 12        | Work   |
| 13        | Off    |
| 14        | Off    |

Then it repeats from day 1. (3 on, 2 off, 3 on, 2 off, 2 on, 2 off.)

## Reference date

**11 September 2026 = Cycle day 1** (first day of the first work block).

The app uses this fixed anchor to calculate the cycle day for any date — past or future — using simple modulo arithmetic.

## How to run

1. Open the `roster-app` folder.
2. Double-click `index.html` (or open it in any browser).
3. No server, no install, no build step required.
