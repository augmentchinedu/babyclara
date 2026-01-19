import { gql } from "@apollo/client/core";

export const SIGNIN = gql`
  mutation Signin($input: SignInInput!) {
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
