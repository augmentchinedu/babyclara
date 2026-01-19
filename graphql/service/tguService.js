// graphql/service/tguService.js
export const TGU_URL = "https://great-unknown.onrender.com/graphql";

/**
 * Make a request to TGU GraphQL API and return data.
 * If TGU responds with errors, include them in the `error` property instead of throwing.
 */
export async function tguRequest(query, variables = {}) {
  try {
    const res = await fetch(TGU_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    const data = await res.json();

    // If TGU has GraphQL errors, return them for resolver to handle
    if (data.errors?.length) {
      const gqlErr = data.errors[0];
      const code = gqlErr.extensions?.code || "UNKNOWN_ERROR";
      const message = gqlErr.message || "TGU request returned an error";

      console.error("❌ TGU GraphQL errors:", data.errors);

      return { error: { code, message } };
    }

    return data.data;
  } catch (err) {
    console.error("❌ TGU request failed:", err);
    return { error: { message: err.message, code: "NETWORK_ERROR" } };
  }
}

// -------------------------
// GraphQL typeDefs
// -------------------------
export const typeDefs = `
type User {
  id: ID!
  username: String!
  email: String!
}

type AuthError {
  message: String!
  code: String!
}

type AuthPayload {
  token: String       # nullable
  user: User          # nullable
  error: AuthError    # nullable
}

input SignUpInput {
  username: String!
  email: String!
  password: String!
}

input SignInInput {
  identifier: String!
  password: String!
}

type Mutation {
  signup(input: SignUpInput!): AuthPayload!
  signin(input: SignInInput!): AuthPayload!
}

type Query {
  _empty: String
}
`;

// -------------------------
// TGU GraphQL queries/mutations
// -------------------------
export const TGU_SIGNUP = `
  mutation SignUp($input: SignUpInput!) {
    signup(input: $input) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const TGU_SIGNIN = `
  mutation SignIn($input: SignInInput!) {
    signin(input: $input) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;
