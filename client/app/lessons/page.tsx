'use client'
import React, { useEffect } from 'react'
import Link from 'next/link'
import useLocalStorage from '@/hooks/useLocalStorage'
import { Opening } from '@/types/types'
import Button from '@/components/Button'

const LessonsPage = () => {
  const [openings, setOpenings] = useLocalStorage<Opening[]>('openings', []);

  useEffect(() => {
    const fetchOpenings = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/openings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch openings')
      }

      const data = await res.json();
      setOpenings(data);
    }
    fetchOpenings();
  }, [])
  return (
    <main className="p-4 lg:p-10 lg:ml-40">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-[1100px] max-lg:p-5">
        {openings.map((lesson, index) => (
          <div key={index} className="border p-6 rounded-xl shadow-md hover:shadow-xl transition-all">
            <h1 className="text-2xl lg:text-3xl font-bold mb-4">{lesson.name}</h1>
            <p className="text-gray-600 mb-6 line-clamp-2">{lesson.description}</p>

            <Link href={`/lessons/${lesson.code}`} className="inline-block">
              <Button text='Practice Lines' />
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
            <Button text="Contribute" icon="✨" />
          </Link>
        </div>

      </section>
    </main>
  )
}

export default LessonsPage
