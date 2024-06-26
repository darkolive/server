// src/app/api/collections/route.ts
import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
    const collections = getCollectionNames()
    return NextResponse.json(collections)
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching collections' }, { status: 500 })
  }
}
