import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://mock.auth.com",
      applicationID: "mock-client-id",
    },
  ],
} satisfies AuthConfig;
