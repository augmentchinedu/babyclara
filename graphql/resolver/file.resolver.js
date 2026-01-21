import pkg from "graphql-subscriptions";
const { PubSub } = pkg;

export const pubsub = new PubSub();

export const fileResolver = {
  Subscription: {
    fileChanged: {
      subscribe: (_, { workstationId }) =>
        pubsub.asyncIterableIterator("FILE_CHANGED"),
    },
  },
};
