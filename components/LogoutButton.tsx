'use client'

import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-gray-200 text-text-secondary px-4 py-2.5 sm:px-6 rounded-full font-bold hover:bg-gray-300 transition text-sm"
    >
      로그아웃
    </button>
  )
}
