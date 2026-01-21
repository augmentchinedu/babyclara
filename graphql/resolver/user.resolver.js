// /graphql/resolvers/user.resolver.js
import { GraphQLError } from "graphql";
import {
  tguRequest,
  TGU_SIGNUP,
  TGU_SIGNIN,
  TGU_REFRESH_TOKEN,
} from "../service/tguService.js";
import { saveTokens } from "../../core/session/saveTokens.js";
import { bootstrapAfterAuth } from "../../core/runtime/bootstrapAfterAuth.js";

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

        const result = data.signup;
        if (result?.token && result?.refreshToken) {
          saveTokens({
            accessToken: result.token,
            refreshToken: result.refreshToken,
            userId: result.user.id,
          });
          // Bootstrap workstation and projects
          bootstrapAfterAuth(result.user.id, result.token).catch(() => {});
        }

        return result;
      } catch (err) {
        throw mirrorTguError(err, "SIGNUP_FAILED");
      }
    },

    signin: async (_, { input }, { token }) => {
      try {
        const data = await tguRequest(TGU_SIGNIN, { input }, token);
        if (data?.error) throw mirrorTguError(data.error);

        const result = data.signin;
        if (result?.token && result?.refreshToken) {
          saveTokens({
            accessToken: result.token,
            refreshToken: result.refreshToken,
            userId: result.user.id,
          });
          // Bootstrap workstation and projects
          bootstrapAfterAuth(result.user.id, result.token).catch(() => {});
        }

        return result;
      } catch (err) {
        throw mirrorTguError(err, "INVALID_CREDENTIALS");
      }
    },

    refreshToken: async (_, { token: refreshTokenInput }, { token }) => {
      try {
        const data = await tguRequest(
          TGU_REFRESH_TOKEN,
          { token: refreshTokenInput },
          token,
        );
        if (data?.error) throw mirrorTguError(data.error);

        const result = data.refreshToken;
        if (result?.token && result?.refreshToken) {
          saveTokens({
            accessToken: result.token,
            refreshToken: result.refreshToken,
            userId: result.user.id,
          });
          // Bootstrap workstation and projects
          bootstrapAfterAuth(result.user.id, result.token).catch(() => {});
        }

        return result;
      } catch (err) {
        throw mirrorTguError(err, "REFRESH_FAILED");
      }
    },
  },
};
