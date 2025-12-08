import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { ToastProvider } from './components/ToastProvider.jsx'

const HomePage = lazy(() => import('./pages/Home/HomePage.jsx'))
const AboutPage = lazy(() => import('./pages/About/AboutPage.jsx'))
const MapToolPage = lazy(() => import('./pages/MapTool/MapToolPage.jsx'))
const SubmitPage = lazy(() => import('./pages/Submit/SubmitPage.jsx'))
const AdminReviewPage = lazy(() => import('./pages/Admin/AdminReviewPage.jsx'))
const NegotiationRequestsPage = lazy(() => import('./pages/Admin/NegotiationRequestsPage.jsx'))
const PrivacyPage = lazy(() => import('./pages/Legal/PrivacyPage.jsx'))
const TermsPage = lazy(() => import('./pages/Legal/TermsPage.jsx'))
const NegotiatePage = lazy(() => import('./pages/Negotiate/NegotiatePage.jsx'))

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Header />
        <main className="px-4 py-8">
          <Suspense fallback={<div className="py-10 text-center text-slate-600">Loading...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/map" element={<MapToolPage />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/admin" element={<AdminReviewPage />} />
              <Route path="/admin/negotiations" element={<NegotiationRequestsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/negotiate" element={<NegotiatePage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </ToastProvider>
    </BrowserRouter>
  )
}
