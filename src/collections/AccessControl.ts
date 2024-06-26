import { CollectionConfig } from 'payload/types'
import DefaultCollectionsField from '../components/DefaultCollectionsField' // Adjust the import path if necessary

const AccessControl: CollectionConfig = {
  slug: 'access-control',
  fields: [
    {
      name: 'collectionName',
      type: 'ui',
      label: 'Collection Name',
      admin: {
        components: {
          Field: DefaultCollectionsField,
        },
      },
      required: true,
    },
    {
      name: 'defaultCollections',
      type: 'ui',
      label: 'Default Collections',
      admin: {
        components: {
          Field: DefaultCollectionsField,
        },
      },
    },
    {
      name: 'accessLevels',
      type: 'array',
      label: 'Access Levels',
      fields: [
        {
          name: 'accessLevel',
          type: 'relationship',
          relationTo: 'access-levels',
          required: true,
          label: 'Access Level',
        },
        {
          name: 'crud',
          type: 'text',
          label: 'CRUD',
          defaultValue: '0000',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'permissions',
          type: 'group',
          label: 'Permissions',
          fields: [
            {
              name: 'create',
              type: 'checkbox',
              label: 'Create',
              defaultValue: false,
            },
            {
              name: 'read',
              type: 'checkbox',
              label: 'Read',
              defaultValue: false,
            },
            {
              name: 'update',
              type: 'checkbox',
              label: 'Update',
              defaultValue: false,
            },
            {
              name: 'delete',
              type: 'checkbox',
              label: 'Delete',
              defaultValue: false,
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (data.accessLevels) {
          data.accessLevels = data.accessLevels.map((level: AccessLevel) => {
            if (level.permissions) {
              const { create, read, update, delete: del } = level.permissions
              level.crud = `${create ? '1' : '0'}${read ? '1' : '0'}${update ? '1' : '0'}${
                del ? '1' : '0'
              }`
            } else {
              level.crud = '0000'
            }
            return level
          })
        }
        return data
      },
    ],
    afterRead: [
      async ({ doc }) => {
        if (doc.accessLevels) {
          doc.accessLevels = doc.accessLevels.map((level: AccessLevel) => {
            if (typeof level.accessLevel === 'object' && 'id' in level.accessLevel) {
              const { name, createdAt, updatedAt, ...cleanedAccessLevel } = level.accessLevel
              return {
                ...level,
                accessLevel: {
                  ...cleanedAccessLevel,
                  crud: level.crud,
                },
                crud: undefined,
                permissions: undefined,
                id: undefined,
              }
            }
            return level
          })
        }
        return doc
      },
    ],
  },
  admin: {
    useAsTitle: 'collectionName',
  },
}

export default AccessControl
