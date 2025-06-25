'use client'
import Button from '@/components/Button';
import React, { FormEvent, useState } from 'react'

const ContributeOpening = () => {
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/openings/add`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name, description, code
        })
      });


      if (!res.ok) {
        throw new Error('Failed to submit opening');
      }

      await res.json();

      // Reset form fields after successful submission
      setName('');
      setCode('');
      setDescription('');
    }
    catch (error) {
      console.error("Error submitting form:", error);

    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-6 flex-col">
      <form onSubmit={(e: FormEvent) => { handleSubmit(e) }} className="shadow-lg rounded-xl p-8 w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-600">♟️ Contribute New Opening</h1>

        <div className="flex flex-col space-y-2">
          <label htmlFor="name" className="text-sm font-semibold text-gray-700">Opening Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g., Caro-Kann Defense"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="code" className="text-sm font-semibold text-gray-700">Code</label>
          <input
            type="text"
            id="code"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g., carokann"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="A solid defense against 1.e4, emphasizing structure and counterattack..."
          ></textarea>
        </div>

        <Button type="submit" text="Submit Opening" />
      </form>
    </div>
  )
}

export default ContributeOpening
