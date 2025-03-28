import React from 'react'
import Link from 'next/link'

const lessons = [
  {
    title: "Caro-Kann Opening",
    description:
      "The Caro-Kann Defense is a solid defense to 1.e4. It is a great opening for beginners to learn as it is solid and has a clear plan.",
    link: "/lessons/carokann",
  },
  {
    title: "Jobava London System",
    description:
      "The Jobava London System is a solid opening for white that is easy to learn and has a clear plan.",
    link: "/lessons/jobava",
  },
];

const LessonsPage = () => {
  return (
    <main className="p-10">
      <section className='grid grid-cols-2 gap-6 max-w-[1100px]'>
        {
          lessons.map((lesson, index) => (
            <div key={index}>
              <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
              <p className="text-gray-600 mb-6">
                {lesson.description}
              </p>

              <Link href={lesson.link} className="inline-block">
                <button className="p-3 px-6 bg-blue-100 text-blue-800 rounded-lg font-semibold hover:bg-blue-200 transition-colors">
                  Start Learning
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