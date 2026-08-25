import React from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import TopSellers from '../components/TopSellers';
import HampersTeaser from '../components/HampersTeaser';
import MissionVision from '../components/MissionVision';
import TestimonialsSection from '../components/TestimonialsSection';
// import InstagramFeed from '../components/InstagramFeed'; // replaced by ReelsSection
import ReelsSection from '../components/ReelsSection';
import JoinCommunity from '../components/JoinCommunity';
import WorkshopUpdates from '../components/WorkshopUpdates';
// Birthday "Spin & Win" campaign — disabled. Un-comment the import + the render below to re-enable.
// import BirthdayOfferPopup from '../components/birthday/BirthdayOfferPopup';
// import { CAMPAIGN_LIVE } from '../data/birthdayOffers';

const HomePage = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <TopSellers />
      <HampersTeaser />
      <AboutSection />
      <MissionVision />
      <JoinCommunity />
      <TestimonialsSection />
      {/* <InstagramFeed /> replaced by ReelsSection */}
      <ReelsSection />
      <WorkshopUpdates />
      {/* Birthday "Spin & Win" campaign — disabled. Re-enable by un-commenting the import above and the line below. */}
      {/* {CAMPAIGN_LIVE && <BirthdayOfferPopup />} */}
    </div>
  );
};

export default HomePage;
