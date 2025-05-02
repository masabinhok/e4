'use client'
import React from 'react'
import Image from 'next/image';
import sabinOg from "../../public/sabin-og.jpg";
import Link from 'next/link';

const CreditPage = () => {
  return (
    <main className='w-full min-h-screen flex items-center justify-center p-4'>
      <section className='max-w-4xl mx-auto rounded-xl shadow-lg overflow-hidden p-6 md:p-8'>
        <div className='flex flex-col md:flex-row gap-8 items-center'>
          <div className='flex-shrink-0 flex flex-col items-center justify-center gap-3'>
            <div className='rounded-full border-4 border-blue-100 p-1'>
              <Image

                src={sabinOg}
                alt='Sabin Shrestha'
                width={160}
                height={160}
                className='rounded-full object-cover w-auto h-auto'
                priority
              />


            </div>
            <div className='flex flex-col gap-1 items-center justify-center text-yellow-200'>
              <Link href="https://www.chess.com/member/sabinshrestha9">
                <span className='text-xs'>sabinshrestha9 -chess.com</span>
              </Link>
              <span className='text-xs'>masabinhok-
                <Link href="https://github.com/masabinhok">
                  github
                </Link>
                <Link href="https://instagram.com/masabinhok">
                  /insta
                </Link>
                <Link href="https://x.com/masabinhok">
                  /x
                </Link></span>
            </div>

          </div>

          <div className='space-y-4'>
            <h1 className='text-2xl md:text-3xl font-bold text-gray-200'>
              Hi, I&apos;m Sabin Shrestha
            </h1>

            <div className='space-y-3 text-gray-400'>
              <p>
                I&apos;m a chess enthusiast rated around 1200. Like many players, I wanted to improve my opening repertoire, but found video tutorials boring and existing practice tools either lacking or too expensive.
              </p>

              <p>
                When I discovered chessreps, I loved the interactive approach - it was exactly how I wanted to learn openings. But the cost was prohibitive for me, so I decided to build my own version.
              </p>

              <p>
                This project is completely free and open for everyone to use. While it&apos;s still a work in progress, I believe it can help fellow chess players improve their game without breaking the bank.
              </p>

              <p className='font-medium text-blue-400'>
                I hope you find it useful! Feel free to share any feedback or suggestions for improvement.
                <span onClick={() => {
                  navigator.clipboard.writeText("sabin.shrestha.er@gmail.com")
                }} className=' text-xs underline ml-2 text-yellow-200'>
                  <br />
                  sabin.shrestha.er@gmail.com</span>
              </p>
            </div>

            <div className='pt-2'>
              <span className='inline-block bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium'>
                Happy Chess Learning!
              </span>
            </div>
          </div>
        </div>
        <div className='mt-10 w-full'>
          <div className='border-t pt-5 text-center'>
            <p className='text-sm text-gray-500 mb-2'>Built with:</p>
            <div className='flex flex-wrap items-center justify-center gap-4'>
              <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer"
                className='px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 text-sm transition'>
                Next.js
              </a>
              <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer"
                className='px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 text-sm transition'>
                TailwindCSS
              </a>
              <a href="https://github.com/Clariity/react-chessboard" target="_blank" rel="noopener noreferrer"
                className='px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 text-sm transition'>
                React Chessboard
              </a>
              <a href="https://github.com/jhlywa/chess.js" target="_blank" rel="noopener noreferrer"
                className='px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 text-sm transition'>
                Chess.js
              </a>
              <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer"
                className='px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 text-sm transition'>
                TypeScript
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default CreditPage