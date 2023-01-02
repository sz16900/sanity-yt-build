// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import sanityClient from '@sanity/client'

export const config = {
    // NEXT_PUBLIC_ before SANITY to make available to the api annnnnd the client //
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    useCdn: process.env.NODE_ENV === "production",
    token: process.env.SANITY_API_TOKEN,
}

const client = sanityClient(config);

export default async function createComment(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const {_id, name, email, comment} = JSON.parse(req.body);

    try {
        await client.create({
            _type: 'comment',
            post: {
                _type: 'reference',
                ref: _id
            },
            name, 
            email,
            comment
        });
    } catch (err) {
        console.log("Couldn't submit the comment");
        return res.status(500).json({message: "Couldn't submit the comment", err})
    } 
    console.log("Comment Submitted!'");
    return res.status(200).json({ message: 'Comment Submitted!' })
}
