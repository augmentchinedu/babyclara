// graphql/service/tguService.js
export const TGU_URL = "https://great-unknown.onrender.com/graphql";

export async function tguRequest(query, variables = {}) {
  try {
    const res = await fetch(TGU_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    const data = await res.json();
    if (data.errors) {
      console.error("❌ TGU GraphQL errors:", data.errors);
      throw new Error("TGU request returned errors");
    }
    return data.data;
  } catch (err) {
    console.error("❌ TGU request failed:", err);
    throw err;
  }
}

// GraphQL typeDefs
export const typeDefs = `
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
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

// TGU GraphQL queries/mutations
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
