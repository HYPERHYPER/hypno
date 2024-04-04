/**
 * It takes a date string in format yyyy-mm-dd, converts it to a date, and returns a formatted date MMM dd, yyyy
 * @param {string} value - date string (yyyy-mm-dd)
 * @returns A formatted date (MMM dd, yyyy)
 */
export function formatDate(value: string) {
    const formattedDate = new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    return formattedDate;
}

/**
 * The function `formatTimestamp` takes a timestamp string, converts it to a formatted date and time
 * string in the format "MMM DD HH:MM AM/PM", and returns the formatted string.
 * @param {string} timestampStr - The `formatTimestamp` function takes a timestamp string as input and
 * formats it into a more readable date and time format. The timestamp string should be in a format
 * that can be parsed by the `Date` constructor in JavaScript.
 * @returns The function `formatTimestamp` takes a timestamp string as input and returns a formatted
 * timestamp string in the format "MMM DD HH:MMAM/PM".
 */
export function formatTimestamp(timestampStr: string): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const date = new Date(timestampStr);
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;

  return `${month} ${day} ${formattedHours}:${minutes}${ampm}`;
}