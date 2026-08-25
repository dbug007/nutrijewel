import React from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import TopSellers from '../components/TopSellers';
import MissionVision from '../components/MissionVision';
import TestimonialsSection from '../components/TestimonialsSection';
import InstagramFeed from '../components/InstagramFeed';
import JoinCommunity from '../components/JoinCommunity';
import WorkshopUpdates from '../components/WorkshopUpdates';
import BirthdayOfferPopup from '../components/birthday/BirthdayOfferPopup';

/* Test clone of HomePage — identical sections + the birthday "spin to win"
   notification and a persistent floating "Spin & Win" badge. */
const BirthdayHomePage = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <TopSellers />
      <AboutSection />
      <MissionVision />
      <JoinCommunity />
      <TestimonialsSection />
      <InstagramFeed />
      <WorkshopUpdates />
      <BirthdayOfferPopup />
    </div>
  );
};

export default BirthdayHomePage;
