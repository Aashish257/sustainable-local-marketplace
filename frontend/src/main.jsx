import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Broken image anywhere (dead seed URL, bad seller link) -> neutral leaf placeholder
// instead of a black box with alt text. Capture phase, because image errors don't bubble.
const IMAGE_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#e2ece7"/>' +
    '<path d="M200 120c-60 40-80 100-60 160 60 0 100-40 120-100-20 0-40-20-60-60z" fill="#a7c4b5"/>' +
    '<path d="M150 290c20-50 50-90 90-120" stroke="#7fa893" stroke-width="8" fill="none" stroke-linecap="round"/></svg>'
  );
window.addEventListener(
  "error",
  (e) => {
    const img = e.target;
    if (img instanceof HTMLImageElement && !img.dataset.fallback) {
      img.dataset.fallback = "1";
      img.src = IMAGE_FALLBACK;
    }
  },
  true
);

const queryClient = new QueryClient();
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
