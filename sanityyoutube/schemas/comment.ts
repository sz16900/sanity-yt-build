import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
        name: 'approved',
        title: 'Approved',
        type: 'boolean',
        description: 'Comments will not show on the site without approval',
      }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
        name: 'comment',
        title: 'Comment',
        type: 'text',
      }),
      defineField({
        name: 'post',
        title: 'Post',
        type: 'reference',
        to: [{ type: "post" }]
      }),
  ]
})
