import { CollectionConfig } from 'payload/types'
import fs from 'fs'
import path from 'path'

// Determine the correct collections directory based on the environment
const getCollectionsDir = () => {
  const devCollectionsDir = path.resolve(__dirname, '../collections')
  const prodCollectionsDir = path.resolve(process.cwd(), 'src/collections')
  return fs.existsSync(devCollectionsDir) ? devCollectionsDir : prodCollectionsDir
}

const getCollectionNames = (): { label: string; value: string }[] => {
  const collectionsDir = getCollectionsDir()
  try {
    const files = fs.readdirSync(collectionsDir)
    return files
      .filter((file) => file !== 'AccessControl.ts' && file !== 'AccessLevels.ts')
      .map((file) => ({
        label: path.basename(file, '.ts'),
        value: path.basename(file, '.ts'),
      }))
  } catch (err) {
    console.error(`Error reading collections directory: ${err}`)
    return []
  }
}

// Define the beforeChange hook to set 'crud' value based on permissions
const beforeChangeHook = async ({ data }: { data: any }) => {
  if (data.accessLevels) {
    data.accessLevels = data.accessLevels.map((level: any) => {
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
}

// Define the afterRead hook to include the CRUD field within the accessLevel object and remove unwanted fields
const afterReadHook = async ({ doc }: { doc: any }) => {
  if (doc.accessLevels) {
    doc.accessLevels = doc.accessLevels.map((level: any) => {
      if (typeof level.accessLevel === 'object' && 'id' in level.accessLevel) {
        const { name, createdAt, updatedAt, ...cleanedAccessLevel } = level.accessLevel
        return {
          ...level,
          accessLevel: {
            ...cleanedAccessLevel,
            crud: level.crud,
          },
          crud: undefined, // Remove the original crud field
          permissions: undefined, // Remove the permissions field
          id: undefined, // Remove id field
        }
      }
      return level
    })
  }
  return doc
}

const AccessControl: CollectionConfig = {
  slug: 'access-control',
  fields: [
    {
      name: 'collectionName',
      type: 'select',
      label: 'Collection Name',
      options: getCollectionNames(),
      required: true,
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
    beforeChange: [beforeChangeHook],
    afterRead: [afterReadHook],
  },
  admin: {
    useAsTitle: 'collectionName',
  },
}

export default AccessControl
