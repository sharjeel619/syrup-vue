export const sortNumberAscending = (a, b) => a - b;
export const sortNumberDescending = (a, b) => b - a;
export const sortStringAscending = (a, b) => a.localeCompare(b);
export const sortStringDescending = (a, b) => b.localeCompare(a);
export const sortDateAscending = (a, b) => new Date(a) - new Date(b);
export const sortDateDescending = (a, b) => new Date(b) - new Date(a);