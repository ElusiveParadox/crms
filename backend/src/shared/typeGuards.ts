export const isTokenPayload = (
  data: unknown
): data is { id: string; email: string } => {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as any).id === "string" &&
    typeof (data as any).email === "string"
  );
};