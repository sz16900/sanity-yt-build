import { GetStaticProps } from 'next';
import Header from '../../components/Header';
import {sanityClient, urlFor} from '../../sanity';
import { Post } from '../../typings';
import PortableText from 'react-portable-text';
import {useForm, SubmitHandler} from 'react-hook-form';
import { useState } from 'react';

interface Props {
    post: Post;
}

interface IFormInput {
    _id: string; 
    name: string;
    email: string;
    comment: string;
};

function Post({post}: Props) {

    console.log(post)

    const [submitted, setSubmitted] = useState(false);

    const {register, handleSubmit, formState: {errors}} = useForm<IFormInput>();
    // this is a little confussing but it says: lets create a submit function with SubmitHandler prop type and pass in the IFormInput type that we casted?
    // so now it knows what to expect!
    const onSubmit: SubmitHandler<IFormInput> = async(data) => {
        await fetch("/api/createComment", {
            method: "POST",
            body: JSON.stringify(data),
        }).then(() => {
            console.log(data);
            setSubmitted(true);
        }).catch((err) => {
            console.log(err);
            setSubmitted(false);

        })
    };

  return (
    <main>
        <Header />
        <img className="w-full h-40 object-cover" src={urlFor(post.mainImage).url()!} alt="" />
        <article className="max-w-3xl mx-auto p-5">
            <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
            <h2 className="text-xl font-light text-gray-500 mb-2">{post.description}</h2>
            <div className="flex items-center space-x-2">
                <img className="h-10 w-10 rounded-full" src={urlFor(post.author.image).url()!} alt="" />
                <p className="font-extralight text-sm">Blog post by <span className="text-green-500">{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleDateString()}</p>
            </div>
            <div className="mt-10">
                <PortableText
                    className=""
                    dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
                    projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
                    content={post.body}
                    serializers={{
                        h1: (props: any) => (
                            <h1 className="text-2xl font-bold my-5" {...props}></h1>
                            ),
                        h2: (props: any) => (
                            <h2 className="text-xl font-bold my-5" {...props}></h2>
                        ),
                        li: ({ children }: any) => (
                            <li className="ml-4 list-disc">{children}</li>
                        ),
                        link: ({href, children}: any) => (
                            <a href={href} className="text-blue-500 hover:underline">{children}</a>
                        ),
                    }}
                />
            </div>
        </article>
        <hr className="mx-w-lg my-5 border border-yellow-500" />

        {/* if submitted do something else do something else */}
        {submitted ? (
            <div className='flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl  mx-auto'>
                <h1 className='text-3xl font-bold'>Thank you for submitting your comment</h1>
                <p>Once its been approved, it will appear bellow.</p>
            </div>
        ): (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col p-5 max-w-2xl mx-auto mb-10" action="">
            <h3 className="text-sm text-yellow-500">Enjoyed the article?</h3>
            <h4 className='text-3xl font-bold'>Leave a comment bellow!</h4>
            <hr className="py-3 mt-2"></hr>
            <input 
                {...register("_id")}
                type="hidden"
                name="_id"
                value={post._id}
            />

            <label className="block mb-5">
                <span className="text-gray-700">Name</span>
                <input {...register("name", {required: true})} className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring" placeholder="Tu madre" type="text" />
            </label>
            <label className="block mb-5">
                <span className="text-gray-700">Email</span>
                <input {...register("email", {required: true})}className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring" placeholder="Tu madre" type="email" />
            </label>
            <label className="block mb-5">
                <span className="text-gray-700">Comment</span>
                <textarea {...register("comment", {required: true})} className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500 outline-none focus:ring" placeholder="Tu madre" rows={8} />
            </label>
            <div className="flex flex-col p-5">
                {errors.name && (<span className="text-red-500"> - The Name Field is Required!</span>)}
                {errors.email && (<span className="text-red-500"> - The Email Field is Required!</span>)}
                {errors.comment && (<span className="text-red-500"> - The Comment Field is Required!</span>)}
            </div>
            <input type="submit" className="shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"/>
        </form>
        )}


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
        _createdAt,
        title,
        author -> {
          name,
          image
        },
        'comments': *[
          _type == "comment" && 
          post._ref == ^._id &&
          approved == true],
        slug,
        description, 
        mainImage,
        body,
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