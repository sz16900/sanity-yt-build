import { GetStaticProps } from 'next';
import Header from '../../components/Header'
import {sanityClient, urlFor} from '../../sanity'
import { Post } from '../../typings';

interface Props {
    post: Post;
}

function Post({post}: Props) {
    console.log(post)
  return (
    <main>
        <Header />
    </main>
  )
}

export default Post

// If a page has Dynamic Routes and uses getStaticProps, it needs to define a list of 
// paths to be statically generated.

// When you export a function called getStaticPaths (Static Site Generation) 
// rom a page that uses dynamic routes, Next.js will statically pre-render all 
// the paths specified by getStaticPaths.

// 1) find the paths to the blog posts

export async function getStaticPaths() {
    const query = `*[_type == "post"] {
        _id,
        slug {
          current
        }
      }`;

  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
        slug: post.slug.current
    }
  }));

  return {
    paths,
    fallback: "blocking"
  }

};

// you have to use getStaticProps with getStaticPaths
// this is telling nextjs, exactly how to use that slug or id to get the information 
//pertaining to a particular post

// 2) populate each page with information

export const getStaticProps: GetStaticProps = async({ params }) => {
    // the zero is to get just the onject back and not an array ... 
    // also, $slug is a placeholder
    const query = `*[_type == "post" && slug.current == $slug][0] {
        _id,
        author -> {
          name,
          image
        },
        slug,
        description,
        mainImage,
        body
      }`;

    // {slug: params?.slug} == this is what the placeholder will be, see above
    // this ? (optional) is for telling typescript that we are aware that params is undefined
    const post = await sanityClient.fetch(query, {
        slug: params?.slug,
      })

    // if post not found
    // return an object, this goes along the fallback from above to tell nextjs to render 404 page
    if (!post) {
        return {
            notFound: true
        }
    }

    // else
    // return an object props
    return {
        props: {
            post,
        },
        // Next.js allows you to create or update static pages after you’ve built your site. 
        //Incremental Static Regeneration (ISR) enables you to use static-generation on a 
        //per-page basis, without needing to rebuild the entire site. With ISR, you can retain
        // the benefits of static while scaling to millions of pages.

        //ISR
        revalidate: 60, // after 60 update the old cached version
    }
}