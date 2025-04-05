import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SECONDS_IN_YEAR = 31536000;
const SECONDS_IN_MONTH = 2592000;
const SECONDS_IN_WEEK = 604800;
const SECONDS_IN_DAY = 86400;

export function parseDuration(seconds: bigint) {
  const secondsNum = Number(seconds);

  if (secondsNum >= SECONDS_IN_YEAR) {
    const years = Math.floor(secondsNum / SECONDS_IN_YEAR);
    const remainingMonths = Math.floor(
      (secondsNum % SECONDS_IN_YEAR) / SECONDS_IN_MONTH
    );

    return {
      value: years + (remainingMonths > 6 ? 1 : 0),
      label: years + (remainingMonths > 6 ? 1 : 0) === 1 ? "Year" : "Years",
    };
  }

  if (secondsNum >= SECONDS_IN_MONTH) {
    const totalMonths = Math.floor(secondsNum / SECONDS_IN_MONTH);
    const remainingDays = Math.floor(
      (secondsNum % SECONDS_IN_MONTH) / SECONDS_IN_DAY
    );

    // If we have 12 or more months, convert to years
    if (totalMonths >= 12) {
      const years = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;

      if (
        remainingMonths > 6 ||
        (remainingMonths === 0 && remainingDays > 15)
      ) {
        return {
          value: years + 1,
          label: years + 1 === 1 ? "Year" : "Years",
        };
      }

      return {
        value: years,
        label: years === 1 ? "Year" : "Years",
      };
    }

    // Handle 11 months case
    if (totalMonths === 11 && remainingDays > 15) {
      return { value: 1, label: "Year" };
    }

    return {
      value: totalMonths + (remainingDays > 15 ? 1 : 0),
      label:
        totalMonths + (remainingDays > 15 ? 1 : 0) === 1 ? "Month" : "Months",
    };
  }

  if (secondsNum >= SECONDS_IN_WEEK) {
    const weeks = Math.floor(secondsNum / SECONDS_IN_WEEK);
    const remainingDays = Math.floor(
      (secondsNum % SECONDS_IN_WEEK) / SECONDS_IN_DAY
    );

    if (weeks === 3 && remainingDays > 3) {
      return { value: 1, label: "Month" };
    }

    return {
      value: weeks + (remainingDays > 3 ? 1 : 0),
      label: weeks + (remainingDays > 3 ? 1 : 0) === 1 ? "Week" : "Weeks",
    };
  }

  if (secondsNum >= SECONDS_IN_DAY) {
    const days = Math.floor(secondsNum / SECONDS_IN_DAY);
    const remainingHours = Math.floor((secondsNum % SECONDS_IN_DAY) / 3600);

    return {
      value: days + (remainingHours > 12 ? 1 : 0),
      label: days + (remainingHours > 12 ? 1 : 0) === 1 ? "Day" : "Days",
    };
  }

  return null;
}
