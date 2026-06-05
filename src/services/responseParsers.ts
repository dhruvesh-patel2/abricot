type EntityWithId = {
  id: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEntityWithId(value: unknown): value is EntityWithId {
  return isRecord(value) && typeof value.id === "string";
}

export function extractEntity<T extends EntityWithId>(
  data: unknown,
  key: string,
  errorMessage: string
): T {
  if (isEntityWithId(data)) {
    return data as T;
  }

  if (isRecord(data) && isEntityWithId(data[key])) {
    return data[key] as T;
  }

  throw new Error(errorMessage);
}
