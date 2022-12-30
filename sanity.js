import {createClient, createCurrentUserHook} from "next-sanity";
import imageUrlBuilder from '@sanity/image-url'
export const config = {
    // NEXT_PUBLIC_ before SANITY to make available to the api annnnnd the client //
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    apiVersion: "2021-12-25",
    useCdn: process.env.NODE_ENV === "production",
}

// set up the client for fetching data in the getProps page functions
export const sanityClient = createClient(config);

// https://www.sanity.io/docs/image-url //
export const urlFor = (source) => imageUrlBuilder(config).image(source);

// Helper function for using the current logged user in user account
// export const useCurrentUser = createCurrentUserHook(config);