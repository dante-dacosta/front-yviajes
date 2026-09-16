import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RegistroViaje from './components/RegistroViaje';
import ListaViajes from './components/ListaViajes';
import EditarViaje from './components/EditarViaje';
import MainLayout from './components/MainLayout';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas publicas */}
          <Route path="/login" element={<Login />} />

          {/* Rutas privadas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/historial" element={<ListaViajes />} />
              <Route path="/nuevo-viaje" element={<RegistroViaje />} />
              <Route path="/editar-viaje/:id" element={<EditarViaje />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App;