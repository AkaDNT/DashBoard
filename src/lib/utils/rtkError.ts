export type RtqUnknownError = unknown;

type FetchBaseQueryError = { status: number | string; data?: unknown };
type SerializedError = { message?: string; code?: string; name?: string; stack?: string };

const pickFirstString = (obj: Record<string, unknown>, keys: string[]) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v;
    if (Array.isArray(v)) {
      const s = v.map((x) => (typeof x === "string" ? x : "")).filter(Boolean).join(", ");
      if (s) return s;
    }
    if (v && typeof v === "object") {
      const flat = Object.values(v as Record<string, unknown>)
        .flatMap((x) => (Array.isArray(x) ? x : [x]))
        .map((x) => (typeof x === "string" ? x : ""))
        .filter(Boolean)
        .join(", ");
      if (flat) return flat;
    }
  }
  return null;
};

const isFetchBaseQueryError = (e: RtqUnknownError): e is FetchBaseQueryError =>
  !!e && typeof e === "object" && "status" in (e as any);

const isSerializedError = (e: RtqUnknownError): e is SerializedError =>
  !!e && typeof e === "object" && ("message" in (e as any) || "code" in (e as any));

export function extractRtqErrorMessage(err: RtqUnknownError, fallback = "Something went wrong") {
  if (!err) return fallback;
  if (isFetchBaseQueryError(err)) {
    const d = err.data;
    if (typeof d === "string" && d.trim()) return d;
    if (d && typeof d === "object") {
      const obj = d as Record<string, unknown>;
      const msg =
        pickFirstString(obj, [
          "message",
          "error",
          "detail",
          "title",
          "errors",
          "error_description",
          "msg",
          "reason",
        ]) || pickFirstString({ root: obj }, ["root"]);
      if (msg) return msg;
      try {
        const json = JSON.stringify(obj);
        if (json && json !== "{}") return json;
      } catch {}
    }
    if (typeof err.status === "string") return err.status;
    return fallback;
  }
  if (isSerializedError(err) && typeof err.message === "string" && err.message.trim()) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  if (typeof err === "object" && err && "message" in (err as any) && typeof (err as any).message === "string")
    return (err as any).message as string;
  return fallback;
}
