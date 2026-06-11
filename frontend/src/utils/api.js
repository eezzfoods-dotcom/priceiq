import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 })

export const searchShopping = (q) => api.get(`/shopping/search?q=${encodeURIComponent(q)}`)
export const searchGrocery = (q, city = 'Chennai') => api.get(`/grocery/search?q=${encodeURIComponent(q)}&city=${city}`)
export const getPopularGrocery = () => api.get('/grocery/popular')
export const searchFood = (q, city = 'Chennai') => api.get(`/food/search?q=${encodeURIComponent(q)}&city=${city}`)
export const getFuelPrices = (city = 'Chennai') => api.get(`/fuel/prices?city=${city}`)
export const getAllCitiesFuel = () => api.get('/fuel/all-cities')
export const getFuelAlerts = (city = 'Chennai') => api.get(`/fuel/alerts?city=${city}`)
export const getWeather = (city = 'Chennai', lat = null, lon = null) => {
  let url = `/weather/current?city=${city}`
  if (lat && lon) url += `&lat=${lat}&lon=${lon}`
  return api.get(url)
}

export default api
