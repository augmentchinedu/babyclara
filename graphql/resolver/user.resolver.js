// /graphql/resolvers/user.resolver.js
import { GraphQLError } from "graphql";
import { tguRequest, TGU_SIGNUP, TGU_SIGNIN } from "../service/tguService.js";

function mirrorTguError(err, fallbackCode = "UNKNOWN_ERROR") {
  // If err is already a GraphQLError, just throw it
  if (err instanceof GraphQLError) return err;

  // TGU error object may have code & message
  const code = err?.code || fallbackCode;
  const message = err?.message || "An error occurred";

  return new GraphQLError(message, {
    extensions: { code },
  });
}

export const userResolver = {
  Mutation: {
    signup: async (_, { input }) => {
      try {
        const data = await tguRequest(TGU_SIGNUP, { input });

        // If TGU returns an error, throw it
        if (data?.error) throw mirrorTguError(data.error);

        if (!data?.signup) {
          // fallback if TGU returns null without error
          throw mirrorTguError({
            message: "User already exists",
            code: "USER_EXISTS",
          });
        }

        return data.signup;
      } catch (err) {
        throw mirrorTguError(err, "SIGNUP_FAILED");
      }
    },

    signin: async (_, { input }) => {
      try {
        const data = await tguRequest(TGU_SIGNIN, { input });

        if (data?.error) throw mirrorTguError(data.error);

        if (!data?.signin) {
          // fallback if TGU returns null without error
          throw mirrorTguError({
            message: "Invalid credentials",
            code: "INVALID_CREDENTIALS",
          });
        }

        return data.signin;
      } catch (err) {
        throw mirrorTguError(err, "INVALID_CREDENTIALS");
      }
    },
  },
};
