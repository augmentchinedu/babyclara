// graphql/resolver/user.resolver.js
import { tguRequest, TGU_SIGNUP, TGU_SIGNIN } from "../service/tguService.js";

export const userResolver = {
  Mutation: {
    signup: async (_, { input }) => {
      console.log("🔥 SIGNUP RESOLVER HIT → TGU", input);
      try {
        const data = await tguRequest(TGU_SIGNUP, { input });
        if (!data?.signup) throw new Error("TGU signup returned null");
        console.log("✅ TGU signup response:", data.signup);
        return data.signup;
      } catch (err) {
        console.warn("❌ TGU signup failed, falling back to dummy", err.message);
        return {
          token: "dummy-token",
          user: {
            id: "1",
            username: input.username,
            email: input.email,
          },
        };
      }
    },

    signin: async (_, { input }) => {
      console.log("🔥 SIGNIN RESOLVER HIT → TGU", input);
      try {
        const data = await tguRequest(TGU_SIGNIN, { input });
        if (!data?.signin) throw new Error("TGU signin returned null");
        console.log("✅ TGU signin response:", data.signin);
        return data.signin;
      } catch (err) {
        console.warn("❌ TGU signin failed, falling back to dummy", err.message);
        return {
          token: "dummy-token",
          user: {
            id: "1",
            username: input.identifier,
            email: `${input.identifier}@test.com`,
          },
        };
      }
    },
  },
};
