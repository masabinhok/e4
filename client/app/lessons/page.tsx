'use client'
import React from 'react'
import Link from 'next/link'
import openings from '@/constants/openings'

const LessonsPage = () => {
  return (
    <main className="p-4 lg:p-10 lg:ml-40">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-[1100px] max-lg:p-5">
        {openings.map((lesson, index) => (
          <div key={index} className="border p-6 rounded-xl shadow-md hover:shadow-xl transition-all">
            <h1 className="text-2xl lg:text-3xl font-bold mb-4">{lesson.name}</h1>
            <p className="text-gray-600 mb-6 line-clamp-2">{lesson.description}</p>

            <Link href={`/lessons/${lesson.code}`} className="inline-block">
              <button className="p-3 px-6 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-lg font-semibold hover:from-blue-200 hover:to-blue-300 transition-all">
                Practice Lines
              </button>
            </Link>
          </div>
        ))}

        {/* Add New Opening Card */}
        <div className="border p-6 rounded-xl shadow-md hover:shadow-xl transition-all">
          <h1 className="text-2xl lg:text-3xl text-blue-500 font-bold mb-4">Add New Opening</h1>
          <p className="text-gray-600 mb-6 line-clamp-2">
            You can add a new opening by clicking the button below. This will allow you to contribute a new opening for everyone to use.
          </p>

          <Link href="/lessons/add" className="inline-block">
            <button className="p-3 px-6 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg font-semibold hover:from-blue-500 hover:to-blue-600 transition-all">
              ✨ Contribute
            </button>
          </Link>
        </div>

      </section>
    </main>
  )
}

export default LessonsPage
