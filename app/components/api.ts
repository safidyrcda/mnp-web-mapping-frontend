'use server'

export const fetchData = async () => {
  const response = await fetch('http://localhost:4000/data')

    return response.json()
}