function padDateValue(value: number) {
  return String(value).padStart(2, "0");
}

function buildLocalDateString(date: Date) {
  return `${date.getFullYear()}-${padDateValue(date.getMonth() + 1)}-${padDateValue(date.getDate())}`;
}

export function getTomorrowDateString() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);

  return buildLocalDateString(date);
}

export function isFutureDate(value: string) {
  if (!value) {
    return false;
  }

  return value > buildLocalDateString(new Date());
}

export function formatTaskDueDate(value?: string | null) {
  if (!value) {
    return "Aucune échéance";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Aucune échéance";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
