import React from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import TopSellers from '../components/TopSellers';
import MissionVision from '../components/MissionVision';
import TestimonialsSection from '../components/TestimonialsSection';
import InstagramFeed from '../components/InstagramFeed';
import JoinCommunity from '../components/JoinCommunity';
import WorkshopUpdates from '../components/WorkshopUpdates';

const HomePage = () => {
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
    </div>
  );
};

export default HomePage;
