'use client'
import React, { FormEvent, useState } from 'react'

const ContributeOpening = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/openings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name, code, description
        })
      });


      if (!res.ok) {
        throw new Error('Failed to submit opening');
      }

      const data = await res.json();
      console.log("Response from server:", data);

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
    <div className="flex justify-center items-center min-h-screen p-6">
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
          <label htmlFor="code" className="text-sm font-semibold text-gray-700">Opening Code</label>
          <input
            type="text"
            id="code"
            name="code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g., caro-kann"
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

        <button

          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          Submit Opening
        </button>
      </form>
    </div>
  )
}

export default ContributeOpening
