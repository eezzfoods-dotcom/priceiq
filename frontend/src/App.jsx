import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shopping from './pages/Shopping'
import Grocery from './pages/Grocery'
import Food from './pages/Food'
import Fuel from './pages/Fuel'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shopping" element={<Shopping />} />
        <Route path="/grocery" element={<Grocery />} />
        <Route path="/food" element={<Food />} />
        <Route path="/fuel" element={<Fuel />} />
      </Route>
    </Routes>
  )
}
