import React, { useState, useEffect } from 'react';
import { SiteNavbar } from './components/SiteNavbar';
import { LandingHero } from './components/LandingHero';
import { AppShowcase } from './components/AppShowcase';
import { VideoSection } from './components/VideoSection';
import { Features } from './components/Features';
import { PrivacySection } from './components/PrivacySection';
import { Audience } from './components/Audience';
import { Footer } from './components/Footer';
import { Documentation } from './components/Documentation';
import { CommunitySection } from './components/CommunitySection';
import { SecretPage } from './components/SecretPage';

function App() {
  const [page, setPage] = useState<'home' | 'docs'>('home');
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Alt + B (case insensitive)
      if (e.altKey && e.code === 'KeyB') {
        e.preventDefault();
        setShowSecret(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (showSecret) {
    return <SecretPage onClose={() => setShowSecret(false)} />;
  }

  return (
    <main className="min-h-screen bg-white font-sans">
      <SiteNavbar onNavigate={setPage} currentPage={page} />
      
      {page === 'home' ? (
        <>
          <LandingHero />
          <AppShowcase />
          <VideoSection />
          <Features />
          <PrivacySection />
          <Audience />
          <CommunitySection />
        </>
      ) : (
        <Documentation />
      )}

      <Footer onNavigate={setPage} />
    </main>
  );
}

export default App;