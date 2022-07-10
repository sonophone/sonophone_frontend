import { useContext } from 'react'
import { AppContext } from '../contexts/App'

const useApp = () => ({ ...useContext(AppContext) })
export default useApp
