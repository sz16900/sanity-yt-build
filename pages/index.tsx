import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Banner from '../components/Banner'
import Header from '../components/Header'
import {sanityClient, urlFor} from '../sanity'
import { Post } from '../typings'

interface Props {
  posts: [Post];
}

// unlike in the video, this works... seems like props can be passed into after NextPage
// and now it works with <Props>? must be typescript thing
const Home: NextPage<Props> = ({posts}: Props) => {
  console.log(posts);
  return (
    <div className="max-w-7xl mx-auto">
      <Head>
        <title>Medium Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <Banner />


    </div>
  )
}

export default Home

export const getServerSideProps = async () => {
  const query = `*[_type == "post"] {
    _id,
    title,
    author -> {
      name,
      bio,
      image
    },
    description,
    mainImage,
    slug
  }`;

  const posts = await sanityClient.fetch(query);

  // this is the React magic part... here we get the data from the server next.js to the client react page... pretty neat
  return {
    props: {
      posts,
    },
  }
};
