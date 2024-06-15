import type { CollectionConfig } from 'payload/types'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
    {
      name: 'Access',
      type: 'select',
      options: ['admin', 'editor', 'viewer'],
      defaultValue: 'viewer',
      required: true,
    },
  ],
}
