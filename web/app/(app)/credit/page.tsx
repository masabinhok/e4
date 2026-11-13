"use client";
import React from "react";
import Image from "next/image";
import sabinOg from "@/public/images/sabin-og.png";
import Link from "next/link";

const CreditPage = () => {
  return (
    <div className="py-4 lg:py-10">
      <section className="max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-shrink-0 flex flex-col items-center justify-center gap-3">
            <div className="rounded-full border-2 border-amber/60 p-1">
              <Image
                src={sabinOg}
                alt="Sabin Shrestha"
                width={160}
                height={160}
                className="rounded-full object-cover w-auto h-auto"
                priority
                sizes="(max-width: 768px) 100vw, 160px"
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-1 text-sm text-amber">
              <Link href="https://www.chess.com/member/sabinshrestha9">
                <span className="inline-flex min-h-11 items-center px-2">
                  chess.com: sabinshrestha9
                </span>
              </Link>
              <Link
                href="https://github.com/masabinhok"
                className="inline-flex min-h-11 items-center px-2"
              >
                GitHub
              </Link>
              <Link
                href="https://instagram.com/masabinhok"
                className="inline-flex min-h-11 items-center px-2"
              >
                Instagram
              </Link>
              <Link
                href="https://x.com/masabinhok"
                className="inline-flex min-h-11 items-center px-2"
              >
                X
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl">
              Hi, I&apos;m Sabin Shrestha
            </h1>

            <div className="space-y-3 max-w-prose text-muted">
              <p>
                I&apos;m a chess enthusiast rated around 1200. Like many
                players, I wanted to improve my opening repertoire, but found
                video tutorials boring and existing practice tools either
                lacking or too expensive.
              </p>

              <p>
                When I discovered chessreps, I loved the interactive approach -
                it was exactly how I wanted to learn openings. But the cost was
                prohibitive for me, so I decided to build my own version.
              </p>

              <p>
                This project is completely free and open for everyone to use.
                While it&apos;s still a work in progress, I believe it can help
                fellow chess players improve their game without breaking the
                bank.
              </p>

              <p className="text-ivory">
                I hope you find it useful! Feel free to share any feedback or
                suggestions for improvement.
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "sabin.shrestha.er@gmail.com",
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigator.clipboard.writeText(
                        "sabin.shrestha.er@gmail.com",
                      );
                    }
                  }}
                  className="inline-flex min-h-11 cursor-pointer items-center text-sm text-amber underline"
                >
                  <br />
                  sabin.shrestha.er@gmail.com
                </span>
              </p>
            </div>

            <div className="pt-2">
              <span className="font-display text-amber">
                Happy Chess Learning!
              </span>
            </div>
          </div>
        </div>
        <div className="mt-10 w-full">
          <div className="border-t border-line pt-5">
            <p className="text-sm text-muted mb-2">Built with:</p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://nextjs.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-ivory hover:bg-raised"
              >
                Next.js
              </a>
              <a
                href="https://tailwindcss.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-ivory hover:bg-raised"
              >
                TailwindCSS
              </a>
              <a
                href="https://github.com/Clariity/react-chessboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-ivory hover:bg-raised"
              >
                React Chessboard
              </a>
              <a
                href="https://github.com/jhlywa/chess.js"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-ivory hover:bg-raised"
              >
                Chess.js
              </a>
              <a
                href="https://www.typescriptlang.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-ivory hover:bg-raised"
              >
                TypeScript
              </a>
              <a
                href="https://nestjs.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-ivory hover:bg-raised"
              >
                Nest.js
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreditPage;
