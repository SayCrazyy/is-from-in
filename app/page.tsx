"use client"

import Link from "next/link"

export default function Home() {
  return (
    <div className="w-full max-w-xl px-4 md:px-6 py-10 md:py-16 bg-white shadow-xl rounded-xl mx-auto mt-12">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-blue-600 mb-4">is-from.in</h1>
      <p className="text-center text-gray-600 mb-8 text-lg">
        Get your free <span className="font-semibold">is-from.in</span> subdomain, verified with Telegram!
      </p>
      <div className="flex flex-col gap-4">
        <Link href="/register" className="btn btn-primary w-full text-center">
          Create Account
        </Link>
        <Link href="/login" className="btn btn-outline w-full text-center">
          Login
        </Link>
      </div>
      <hr className="my-8" />
      <p className="text-xs text-gray-500 text-center">
        By using this service, you must join the <a href="https://t.me/isfromin" target="_blank" className="underline text-blue-600">Telegram Channel</a>.<br />
        Only one subdomain per user. Telegram verification required.
      </p>
    </div>
  )
}