import RecordLine from '@/components/RecordLine'
import React, { Suspense } from 'react'

const RecordLinePage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <RecordLine />
      </Suspense>
    </div>
  )
}

export default RecordLinePage