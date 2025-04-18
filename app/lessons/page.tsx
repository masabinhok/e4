'use client'
import React from 'react'
import Link from 'next/link'
import openings from '@/constants/openings'

const LessonsPage = () => {
  return (
    <main className="p-4 lg:p-10 lg:ml-40">
      <section className='grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-[1100px] max-lg:p-5'>
        {
          openings.map((lesson, index) => (
            <div key={index}>
              <h1 className="text-2xl lg:text-3xl font-bold mb-4">{lesson.name}</h1>
              <p className="text-gray-600 mb-6">
                {lesson.description}
              </p>

              <Link href={`/lessons/${lesson.code}`} className="inline-block">
                <button className="p-3 px-6 bg-blue-100 text-blue-800 rounded-lg font-semibold hover:bg-blue-200 transition-colors">
                  Practice Lines
                </button>
              </Link>
            </div>
          ))
        }
      </section>
    </main>
  )
}

export default LessonsPage