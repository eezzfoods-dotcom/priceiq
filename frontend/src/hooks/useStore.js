import { create } from 'zustand'

const useStore = create((set) => ({
  selectedCity: 'Chennai',
  setCity: (city) => set({ selectedCity: city }),

  weather: null,
  setWeather: (data) => set({ weather: data }),

  fuelData: null,
  setFuelData: (data) => set({ fuelData: data }),

  fuelAlerts: [],
  setFuelAlerts: (alerts) => set({ fuelAlerts: alerts }),

  activeTab: 'shopping',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))

export default useStore
