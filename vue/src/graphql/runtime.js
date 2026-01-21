import { gql } from "@apollo/client/core";

export const GET_RUNTIME_STATE = gql`
  query GetRuntimeState {
    runtimeState {
      authenticated
      user {
        id
        username
      }
      workstation {
        id
        name
      }
      projects {
        id
        name
        path
      }
      source
      lastUpdated
    }
  }
`;

export const SIGN_OUT = gql`
  mutation SignOut {
    signOut {
      authenticated
      user {
        id
        username
      }
    }
  }
`;

export const RUNTIME_PROJECTS_SUBSCRIPTION = gql`
  subscription OnProjectsUpdated {
    runtimeProjects {
      id
      name
      path
    }
  }
`;
