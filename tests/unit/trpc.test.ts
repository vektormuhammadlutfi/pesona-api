import { describe, expect, it } from "bun:test";
import { appRouter } from "../../src/trpc/router";

describe("tRPC App Router", () => {
  const caller = appRouter.createCaller({
    prisma: {} as any,
    user: null,
  });

  it("should respond to healthCheck query", async () => {
    const result = await caller.healthCheck();
    expect(result.status).toBe("ok");
    expect(result.timestamp).toBeDefined();
  });

  it("should respond to echo query", async () => {
    const result = await caller.echo({ message: "Pesona API test" });
    expect(result.message).toBe("Echo: Pesona API test");
  });
});
