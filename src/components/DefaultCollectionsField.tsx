'use client' // Ensure this directive is at the top of the file

import React, { useEffect, useState } from 'react'

const DefaultCollectionsField: React.FC<{ path: string; name: string; label: string }> = ({
  path,
  name,
  label,
}) => {
  const [collectionNames, setCollectionNames] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    const fetchCollectionNames = async () => {
      try {
        const response = await fetch('/api/available-collections') // Next.js API route
        const data = await response.json()

        if (Array.isArray(data)) {
          setCollectionNames(data)
        } else {
          console.error('Invalid data format:', data)
        }
      } catch (error) {
        console.error('Error fetching collection names:', error)
      }
    }

    fetchCollectionNames()
  }, [])

  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name}>
        {collectionNames.map((collection) => (
          <option key={collection.value} value={collection.value}>
            {collection.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default DefaultCollectionsField
