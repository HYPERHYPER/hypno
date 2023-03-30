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
