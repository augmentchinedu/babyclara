import { BABYCLARA_TGU_URL } from "../../babyclara.config.js";

export const TGU_URL = BABYCLARA_TGU_URL;

/**
 * Make a request to TGU GraphQL API and return data.
 * If TGU responds with errors, include them in the `error` property instead of throwing.
 */
export async function tguRequest(query, variables = {}, token = null) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(TGU_URL, {
      method: "POST",
      headers,
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
// TGU GraphQL queries/mutations
// -------------------------
export const TGU_SIGNUP = `
  mutation SignUp($input: SignUpInput!) {
    signup(input: $input) {
      token
      refreshToken
      user {
        id
        username
        email
      }
      error {
        code
        message
      }
    }
  }
`;

export const TGU_SIGNIN = `
  mutation SignIn($input: SignInInput!) {
    signin(input: $input) {
      token
      refreshToken
      user {
        id
        username
        email
      }
      error {
        code
        message
      }
    }
  }
`;

export const TGU_REFRESH_TOKEN = `
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token) {
      token
      refreshToken
      user {
        id
        username
        email
      }
      error {
        code
        message
      }
    }
  }
`;
