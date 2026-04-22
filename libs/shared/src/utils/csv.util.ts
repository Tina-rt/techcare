/**
 * Converts an array of objects to a CSV string.
 * @param data Array of objects to convert
 * @param columns Array of column definitions with field name and header title
 * @returns CSV formatted string
 */
export function convertToCsv(
  data: any[],
  columns: { field: string; header: string }[],
): string {
  if (!data || !data.length) {
    return columns.map((c) => c.header).join(',') + '\n';
  }

  const header = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        let value = getNestedValue(row, col.field);
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          value = '';
        }
        
        // Handle objects (like address or items)
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }

        // Escape quotes and wrap in quotes
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Helper to get a nested value from an object using a dot-notation path (e.g., 'user.name')
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
