import { equal } from "node:assert/strict";
import { after, describe, it } from "node:test";
import type {
  AdapterAccount,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "@auth/core/adapters";
import Pocketbase from "pocketbase";
import { PocketbaseAdapter } from "../index.ts";

describe("PocketbaseAdapter", () => {
  const client: Pocketbase = new Pocketbase(
    "https://backend.rebackk.xyz/pocketbase"
  );
  const adapter: ReturnType<typeof PocketbaseAdapter> =
    PocketbaseAdapter(client);
  let testUserId = "test-user";

  after(async () => {
    // Check if the user exists
    const user = await adapter.getUser?.(testUserId);
    if (user) {
      // Delete the user
      await client.collection("users").delete(testUserId);
      process.stdout.write("User deleted\n");
    }
  });

  describe("User Management", () => {
    it("should create a new user", async () => {
      const mockUser = {
        email: "test@example.com",
        emailVerified: new Date(),
        id: "test",
        image: "https://example.com/image.jpg",
        name: "Test User",
      } satisfies AdapterUser;

      const createdUser = (await adapter.createUser?.(mockUser)) || null;

      if (!createdUser) {
        throw new Error("User not created");
      }

      testUserId = createdUser.id;

      equal(createdUser.email, mockUser.email);
    });

    it("should get a user by id", async () => {
      const user = (await adapter.getUser?.(testUserId)) || null;

      if (!user) {
        throw new Error("User not found");
      }

      equal(user.id, testUserId);
    });

    it("should get a user by email", async () => {
      const user = (await adapter.getUserByEmail?.("test@example.com")) || null;

      if (!user) {
        throw new Error("User not found");
      }

      equal(user.id, testUserId);
    });

    it("should update a user", async () => {
      const mockUser = {
        email: "test@example.com",
        emailVerified: new Date(),
        id: testUserId,
        image: "https://example.com/image.jpg",
        name: "Test User",
      } satisfies AdapterUser;

      const updatedUser = (await adapter.updateUser?.(mockUser)) || null;

      if (!updatedUser) {
        throw new Error("User not updated");
      }

      equal(updatedUser.email, mockUser.email);
    });
  });

  describe("Account Management", () => {
    it("should link an account", async () => {
      const mockAccount = {
        providerAccountId: "test-provider-account",
        providerId: "test-provider",
        userId: testUserId,
        type: "email",
        provider: "email",
      } satisfies AdapterAccount;

      const linkedAccount = (await adapter.linkAccount?.(mockAccount)) || null;

      if (!linkedAccount) {
        throw new Error("Account not linked");
      }

      equal(linkedAccount.providerAccountId, mockAccount.providerAccountId);
    });

    it("should get a user by provider account id", async () => {
      const providerAccountId = "test-provider-account";
      const provider = "email";

      const user =
        (await adapter.getUserByAccount?.({
          providerAccountId,
          provider,
        })) || null;

      if (!user) {
        throw new Error("User not found");
      }

      equal(user.id, testUserId);
    });

    it("Should unlink an account", async () => {
      const mockAccount = {
        providerAccountId: "test-provider-account",
        providerId: "test-provider",
        userId: testUserId,
        type: "email",
        provider: "email",
      } satisfies AdapterAccount;

      const unlinkedAccount =
        (await adapter.unlinkAccount?.({
          provider: mockAccount.provider,
          providerAccountId: mockAccount.providerAccountId,
        })) || null;

      if (!unlinkedAccount) {
        throw new Error("Account not unlinked");
      }

      equal(unlinkedAccount.providerAccountId, mockAccount.providerAccountId);
    });
  });

  describe("Session Management", () => {
    it("should create a new session", async () => {
      const mockSession = {
        sessionToken: "mock_session_token",
        userId: testUserId,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      } satisfies AdapterSession;

      (await adapter.createSession?.(mockSession)) || null;

      if (!mockSession) {
        throw new Error("Session not created");
      }

      equal(mockSession.sessionToken, "mock_session_token");
    });

    it("should update a session", async () => {
      const mockSession = {
        sessionToken: "mock_session_token",
        userId: testUserId,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 48),
      } satisfies AdapterSession;

      const session = (await adapter.updateSession?.(mockSession)) || null;

      if (!session) {
        throw new Error("Session not found");
      }

      equal(session.sessionToken, "mock_session_token");
    });

    it("Should get a session and user by token", async () => {
      const sessionToken = "mock_session_token";

      const session = (await adapter.getSessionAndUser?.(sessionToken)) || null;

      if (!session) {
        throw new Error("Session not found");
      }

      equal(session.session.sessionToken, sessionToken);
      equal(session.user.id, testUserId);
    });

    it("Should delete a session", async () => {
      const sessionToken = "mock_session_token";

      const session = (await adapter.deleteSession?.(sessionToken)) || null;

      if (!session) {
        throw new Error("Session not found");
      }

      equal(session.sessionToken, sessionToken);
    });
  });

  describe("Verification Management", () => {
    it("Should Create A Verification", async () => {
      const mockVerification = {
        identifier: "mock_identifier",
        token: "mock_token",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      } as VerificationToken;

      const verification =
        (await adapter.createVerificationToken?.(mockVerification)) || null;

      if (!verification) {
        throw new Error("Verification not created");
      }

      equal(verification.token, "mock_token");
    });

    it("Should Get A Verification", async () => {
      const identifier = "mock_identifier";
      const token = "mock_token";

      const verification =
        (await adapter.useVerificationToken?.({
          identifier,
          token,
        })) || null;

      if (!verification) {
        throw new Error("Verification not found");
      }

      equal(verification.token, token);
    });
  });
});
