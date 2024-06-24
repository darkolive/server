import { CollectionConfig } from 'payload/types'

const AccessLevels: CollectionConfig = {
  slug: 'access-levels',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Access Level Name',
    },
  ],
}

export default AccessLevels
