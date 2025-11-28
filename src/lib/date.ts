import {
  startOfMonth,
  endOfMonth as dateFnsEndOfMonth,
  // format,
} from "date-fns";

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

// Returns the beginning of the month for the given date string
export const beginOfMonth = (dataParam: string | Date): Date => {
  let date = dataParam;
  if (typeof date === "string") {
    date = new Date(date);
  }
  const firstDay = startOfMonth(date);
  return firstDay;
};

// Returns the end of the month for the given date string
export const endOfMonth = (dataParam: string | Date): Date => {
  let date = dataParam;
  if (typeof date === "string") {
    date = new Date(date);
  }
  const lastDay = dateFnsEndOfMonth(date);
  return lastDay;
};

export const addDays = (dataParam: string | Date, days: number): Date => {
  let date = dataParam;
  if (typeof date === "string") {
    date = new Date(date);
  }
  const newDate = addDays(date, days);
  return newDate;
};
