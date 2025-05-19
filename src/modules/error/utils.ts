export interface ErrorWithMessage {
  message: string;
  stack?: string;
}

export const errorUtils = {
  isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as Record<string, unknown>).message === "string"
    );
  },

  toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (errorUtils.isErrorWithMessage(maybeError)) return maybeError;

    try {
      return new Error(JSON.stringify(maybeError));
    } catch {
      return new Error(String(maybeError));
    }
  },

  getErrorMessage(error: unknown) {
    return errorUtils.toErrorWithMessage(error).message;
  },
};
