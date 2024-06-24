import { CollectionConfig, FieldHook } from 'payload/types'
import fs from 'fs'
import path from 'path'
import payload from 'payload'

// Define a minimal Payload interface if the types are not available
interface Payload {
  collections: { [key: string]: any }
}

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

let accessLevelOptions: { label: string; value: string }[] = []

const fetchAccessLevelOptions = async () => {
  const accessLevels = await payload.find({
    collection: 'access-levels',
    depth: 0,
    limit: 100,
  })

  accessLevelOptions = accessLevels.docs.map((level: { id: string; name: string }) => ({
    label: level.name,
    value: level.id,
  }))
}

// Pre-fetch access level options
fetchAccessLevelOptions()

// Define the FieldHookArgs type with optional data
interface FieldHookArgs {
  value?: string
  data?: {
    accessLevels?: Array<{
      permissions: {
        create: boolean
        read: boolean
        update: boolean
        delete: boolean
      }
    }>
  }
}

const computeCrudHex: FieldHook = ({ value, data }: FieldHookArgs): string => {
  if (data && data.accessLevels) {
    const permissionsArray = data.accessLevels.flatMap((level) => {
      const { create, read, update, delete: del } = level.permissions
      return [create ? 'C' : '', read ? 'R' : '', update ? 'U' : '', del ? 'D' : '']
    })
    const permissionsString = permissionsArray.join('')
    const hexValue = parseInt(permissionsString, 16).toString(16)
    return hexValue
  }
  return value || ''
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
          name: 'accessLevelId',
          type: 'select',
          label: 'Access Level ID',
          required: true,
          options: accessLevelOptions,
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
            },
            {
              name: 'read',
              type: 'checkbox',
              label: 'Read',
            },
            {
              name: 'update',
              type: 'checkbox',
              label: 'Update',
            },
            {
              name: 'delete',
              type: 'checkbox',
              label: 'Delete',
            },
          ],
        },
      ],
    },
    {
      name: 'crudHex',
      type: 'text',
      label: 'CRUD Hexadecimal',
      required: true,
      hooks: {
        beforeChange: [computeCrudHex],
      },
    },
  ],
}

export default AccessControl
