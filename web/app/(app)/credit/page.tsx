"use client";
import Image from "next/image";
import { useState } from "react";
import sabinOg from "@/public/images/sabin-og.png";

const EMAIL = "sabin.shrestha.er@gmail.com";

const links = [
  {
    label: "chess.com: sabinshrestha9",
    href: "https://www.chess.com/member/sabinshrestha9",
  },
  { label: "GitHub", href: "https://github.com/masabinhok" },
  { label: "Instagram", href: "https://instagram.com/masabinhok" },
  { label: "X", href: "https://x.com/masabinhok" },
];

// Everything e4 uses that someone else made, with its licence.
const credits = [
  {
    what: "Papercut pieces",
    who: "Nikolay Anzarov",
    licence: "CC BY 4.0",
    href: "https://github.com/lichess-org/lila/tree/master/public/piece/papercut",
  },
  {
    what: "Chessnut pieces",
    who: "Alexis Luengas",
    licence: "Apache-2.0",
    href: "https://github.com/lichess-org/lila/tree/master/public/piece/chessnut",
  },
  {
    what: "Opening names",
    who: "Lichess chess-openings",
    licence: "CC0",
    href: "https://github.com/lichess-org/chess-openings",
  },
  {
    what: "Fonts: Nunito, Inter",
    who: "Google Fonts",
    licence: "SIL OFL",
    href: "https://fonts.google.com",
  },
  {
    what: "Board and rules",
    who: "react-chessboard, chess.js",
    licence: "MIT, BSD-2",
    href: "https://github.com/jhlywa/chess.js",
  },
  {
    what: "Sounds",
    who: "Made for e4 (synthesised)",
    licence: "MIT, with e4",
    href: "https://github.com/masabinhok/e4/blob/main/web/scripts/render-sounds.mjs",
  },
];

export default function AboutPage() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex max-w-3xl flex-col gap-12 py-2 lg:py-6">
      <section
        aria-labelledby="author"
        className="flex flex-col gap-6 sm:flex-row sm:items-start"
      >
        <Image
          src={sabinOg}
          alt="Sabin Shrestha"
          width={128}
          height={128}
          className="size-28 shrink-0 rounded-3xl object-cover ring-4 ring-amber/40 sm:size-32"
          priority
        />
        <div className="flex flex-col gap-4">
          <h1 id="author" className="text-4xl">
            Hi, I&apos;m Sabin
          </h1>
          <div className="flex max-w-prose flex-col gap-3 text-muted">
            <p>
              I&apos;m a chess enthusiast rated around 1200. Like many players,
              I wanted to improve my opening repertoire, but found video
              tutorials boring and existing practice tools either lacking or too
              expensive.
            </p>
            <p>
              When I discovered chessreps, I loved the interactive approach: it
              was exactly how I wanted to learn openings. But the cost was
              prohibitive for me, so I decided to build my own version.
            </p>
            <p>
              This project is completely free and open for everyone to use.
              While it&apos;s still a work in progress, I believe it can help
              fellow chess players improve their game without breaking the bank.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-xl bg-raised px-4 font-display text-sm font-bold hover:bg-line"
              >
                {l.label}
              </a>
            ))}
          </div>
          <p className="flex flex-wrap items-center gap-3 text-sm text-muted">
            Feedback and ideas:{" "}
            <span className="select-all text-ivory">{EMAIL}</span>
            <button
              type="button"
              onClick={copy}
              className="min-h-11 rounded-xl px-3 font-display font-bold text-amber hover:bg-raised"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </p>
        </div>
      </section>

      <section aria-labelledby="credits" className="flex flex-col gap-4">
        <h2 id="credits" className="text-2xl">
          Credits
        </h2>
        <p className="text-sm text-muted">
          e4 is MIT-licensed. These parts come from other people, under their
          own licences.
        </p>
        <div className="overflow-x-auto rounded-2xl bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">What</th>
                <th className="px-4 py-3 font-medium">By</th>
                <th className="px-4 py-3 font-medium">Licence</th>
              </tr>
            </thead>
            <tbody>
              {credits.map((c) => (
                <tr key={c.what} className="border-t border-line">
                  <td className="px-4 py-1">
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center font-medium hover:text-amber"
                    >
                      {c.what}
                    </a>
                  </td>
                  <td className="px-4 py-1 text-muted">{c.who}</td>
                  <td className="px-4 py-1 text-muted">{c.licence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
