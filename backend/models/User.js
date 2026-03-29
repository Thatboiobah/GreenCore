import supabase from '../config/db.js'

export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, location, farm_size, created_at')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const createUser = async (userData) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select('id, name, email, location, farm_size, created_at')

  if (error) throw error
  return data[0]
}

export const updateUser = async (id, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('id, name, email, location, farm_size, created_at')

  if (error) throw error
  return data[0]
}