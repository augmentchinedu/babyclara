import { gql } from "@apollo/client/core";

export const SIGNIN = gql`
  mutation Signin($identifier: String!, $password: String!) {
    signin(input: { identifier: $identifier, password: $password }) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;
