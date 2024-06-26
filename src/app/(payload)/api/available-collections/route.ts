import { NextApiRequest, NextApiResponse } from 'next'
import { CollectionConfig, Payload } from 'payload'
import fs from 'fs'
import path from 'path'

const getCollectionsDir = () => {
  const devCollectionsDir = path.resolve(process.cwd(), 'src/collections')
  const prodCollectionsDir = path.resolve(process.cwd(), 'collections')
  return fs.existsSync(devCollectionsDir) ? devCollectionsDir : prodCollectionsDir
}

const getCollectionNames = () => {
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

const getUsedCollectionNames = async (payload: Payload) => {
  const usedCollections = await payload.find({
    collection: 'access-controls',
    limit: 0, // Get all entries
    depth: 0,
    fields: ['collectionName'],
  })
  return usedCollections.docs.map((doc: { collectionName: string }) => doc.collectionName)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const allCollections = getCollectionNames()
    const payload = req.payload as Payload
    const usedCollectionNames = await getUsedCollectionNames(payload)

    const availableCollections = allCollections.filter(
      (collection) => !usedCollectionNames.includes(collection.value),
    )

    res.status(200).json(availableCollections)
  } catch (error) {
    console.error('Error fetching available collections:', error)
    res.status(500).json({ message: 'Error fetching available collections' })
  }
}
