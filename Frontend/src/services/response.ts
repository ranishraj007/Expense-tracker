export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const unwrapApiData = <T>(response: T | ApiEnvelope<T>): T => {
  if (response && typeof response === "object" && "data" in response && "success" in response) {
    return response.data;
  }

  return response as T;
};
