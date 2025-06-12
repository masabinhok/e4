'use client'
import React, { useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'



const LessonsPage = () => {
  return (
    <main className="p-4 lg:p-10 lg:ml-40">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-[1100px] max-lg:p-5">
        {/* have to fetch openings from backend */}
        {/* {openings.map((lesson, index) => ( */}
          {/* <div key={index} className="border p-6 rounded-xl shadow-md hover:shadow-xl transition-all">
            <h1 className="text-2xl lg:text-3xl font-bold mb-4">{lesson.name}</h1>
            <p className="text-gray-600 mb-6 line-clamp-2">{lesson.description}</p>

            <Link href={`/lessons/${lesson.code}`} className="inline-block">
              <Button text='Practice Lines' />
            </Link>
          </div> */}
        {/* ))} */}
        <div className="border p-6 rounded-xl shadow-md hover:shadow-xl transition-all">
          <h1 className="text-2xl lg:text-3xl text-blue-500 font-bold mb-4">Add New Opening</h1>
          <p className="text-gray-600 mb-6 line-clamp-2">
            You can add a new opening by clicking the button below. This will allow you to contribute a new opening for everyone to use.
          </p>
          <Link href="/lessons/add" className="inline-block">
            <Button text="Contribute" icon="✨" />
          </Link>
        </div>
      </section>
    </main>
  )
}

export default LessonsPage
