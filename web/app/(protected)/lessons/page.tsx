'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import { Opening } from '@/types/types'



const LessonsPage = () => {
  const [openings, setOpenings] = useState<Opening[] | []>([]);
  const [pendingOpenings, setPendingOpenings] = useState<Opening[] | []>([]);

  useEffect(() => {
    const fetchPendingOpenings = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/openings/pending`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        }).then(res => {
          if (!res.ok) {
            throw new Error('network error');
          }
          return res.json();
        }).then(data => {
          setPendingOpenings(data);
        });
      }
      catch (error) {
        throw new Error(`Error: ${error}`);
      }
    }
    fetchPendingOpenings();
  }, [])

  useEffect(() => {
    const fetchOpenings = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/openings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        }).then(res => {
          if (!res.ok) {
            throw new Error('network error');
          }
          return res.json();
        }).then(data => {
          setOpenings(data);
        });
      }
      catch (error) {
        throw new Error(`Error: ${error}`);
      }
    }

    fetchOpenings();
  }, [])


  return (
    <main className="p-4 lg:p-10 lg:ml-10">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-[1100px] max-lg:p-5">
        <div className="border p-6 rounded-xl shadow-md hover:shadow-xl transition-all">
          <h1 className="text-2xl lg:text-3xl text-blue-500 font-bold mb-4">Add New Opening</h1>
          <p className="text-gray-600 mb-6 line-clamp-2">
            You can add a new opening by clicking the button below. This will allow you to contribute a new opening for everyone to use.
          </p>
          <Link href="/lessons/add" className="inline-block">
            <Button text="Contribute" icon="✨" />
          </Link>
        </div>
        <div className="border p-6 rounded-xl shadow-md hover:shadow-xl transition-all">
          <h1 className="text-2xl lg:text-3xl text-blue-500 font-bold mb-4">Recorded Lines</h1>
          <p className="text-gray-600 mb-6 line-clamp-2">
            Here are the list of recorded lines, you can record lines by playing it and save it to practice, learn or quiz.
          </p>
          <Link href="/lessons/recorded-lines" className="inline-block">
            <Button text="Play Recorded Lines" icon="✨" />
          </Link>
        </div>
        <div className="border p-6 rounded-xl shadow-md hover:shadow-xl transition-all">
          <h1 className="text-2xl lg:text-3xl text-blue-500 font-bold mb-4">Custom PGNs</h1>
          <p className="text-gray-600 mb-6 line-clamp-2">
            Here are the list of custom PGNs, you can add custom lines directly by pasting a valid pgn and save it to practice, learn or quiz.
          </p>
          <Link href="/lessons/custom-pgns" className="inline-block">
            <Button text="Play Custom PGNs" icon="✨" />
          </Link>
        </div>
        {openings.map((lesson, index) => (
          <div key={index} className="border p-6 rounded-xl shadow-md hover:shadow-xl transition-all ">
            <h1 className="text-2xl lg:text-3xl font-bold mb-4">{lesson.name}</h1>
            <p className="text-gray-600 mb-6 line-clamp-2">{lesson.description}</p>

            <Link href={`/lessons/${lesson.code}`} className="inline-block">
              <Button text='Practice Lines' />
            </Link>
          </div>
        ))}
        {pendingOpenings.map((lesson, index) => (
          <div key={index} className="border p-6 rounded-xl shadow-md hover:shadow-xl transition-all ">
            <h1 className="text-2xl lg:text-3xl font-bold mb-4">{lesson.name}</h1>
            <p className="text-gray-600 mb-6 line-clamp-2">{lesson.description}</p>

            <Link href={`/lessons/${lesson.code}`} className="inline-block">
              <Button disabled={true} text='Pending Request' />
            </Link>
          </div>
        ))}
      </section>
    </main>
  )
}

export default LessonsPage
