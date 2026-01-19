import { gql } from "@apollo/client/core";

export const SIGNUP = gql`
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
