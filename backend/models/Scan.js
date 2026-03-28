import supabase from '../config/db.js'

// Create a new scan
export const createScan = async (scanData) => {
  const { data, error } = await supabase
    .from('scans')
    .insert([scanData])
    .select()
  
  if (error) throw error
  return data[0]
}

// Get all scans for a user
export const getUserScans = async (userId) => {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Get scan by ID
export const getScanById = async (id) => {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// Delete scan
export const deleteScan = async (id) => {
  const { data, error } = await supabase
    .from('scans')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return data
}