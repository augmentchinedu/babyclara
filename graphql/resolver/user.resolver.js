// /graphql/resolvers/user.resolver.js
import { GraphQLError } from "graphql";
import {
  tguRequest,
  TGU_SIGNUP,
  TGU_SIGNIN,
  TGU_REFRESH_TOKEN,
} from "../service/tguService.js";

function mirrorTguError(err, fallbackCode = "UNKNOWN_ERROR") {
  if (err instanceof GraphQLError) return err;

  const code = err?.code || fallbackCode;
  const message = err?.message || "An error occurred";

  return new GraphQLError(message, {
    extensions: { code },
  });
}

export const userResolver = {
  Mutation: {
    signup: async (_, { input }, { token }) => {
      try {
        const data = await tguRequest(TGU_SIGNUP, { input }, token);
        if (data?.error) throw mirrorTguError(data.error);
        return data.signup;
      } catch (err) {
        throw mirrorTguError(err, "SIGNUP_FAILED");
      }
    },

    signin: async (_, { input }, { token }) => {
      try {
        const data = await tguRequest(TGU_SIGNIN, { input }, token);
        if (data?.error) throw mirrorTguError(data.error);
        return data.signin;
      } catch (err) {
        throw mirrorTguError(err, "INVALID_CREDENTIALS");
      }
    },

    refreshToken: async (_, { token: refreshToken }, { token }) => {
      try {
        const data = await tguRequest(
          TGU_REFRESH_TOKEN,
          { token: refreshToken },
          token,
        );
        if (data?.error) throw mirrorTguError(data.error);
        return data.refreshToken;
      } catch (err) {
        throw mirrorTguError(err, "REFRESH_FAILED");
      }
    },
  },
};
