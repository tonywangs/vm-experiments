export function log(event: string, fields: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ at: new Date().toISOString(), event, pid: process.pid, ...fields }));
}

export function describeError(error: unknown) {
  if (!(error instanceof Error)) return String(error);
  const code = "code" in error ? String(error.code) : undefined;
  return code && !error.message.includes(code) ? `${code}: ${error.message}` : error.message;
}
