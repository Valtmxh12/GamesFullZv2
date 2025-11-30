import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Code splitting - Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Juegos = lazy(() => import('./pages/Juegos'));
const DetalleJuego = lazy(() => import('./pages/DetalleJuego'));
const Contacto = lazy(() => import('./pages/Contacto'));
const Tutoriales = lazy(() => import('./pages/Tutoriales'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/juegos" element={<Juegos />} />
              <Route path="/juego/:id" element={<DetalleJuego />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/tutoriales" element={<Tutoriales />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
