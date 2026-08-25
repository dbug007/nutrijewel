import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHamperBuilder } from '../hooks/useHamperBuilder';
import { getOccasion, getOccasionBySlug } from '../data/hampers';
import HamperHero from '../components/hampers/HamperHero';
import OccasionRail from '../components/hampers/OccasionRail';
import PresetHamperGrid from '../components/hampers/PresetHamperGrid';
import HamperBuilder from '../components/hampers/HamperBuilder';
import HamperOffersStrip from '../components/hampers/HamperOffersStrip';
import CorporateBulkCTA from '../components/hampers/CorporateBulkCTA';
import HamperFAQ from '../components/hampers/HamperFAQ';
import '../components/hampers/hampers.css';

/*
 * /hampers, and /hampers/:occasionSlug, which just preselects an occasion so the
 * page can be linked to directly from the nav dropdown or a campaign.
 *
 * The builder state lives here (one instance) and is handed to the three sections
 * that need it, so the occasion rail, the ready-made hampers and the builder all
 * stay in sync without a context.
 */

const HampersPage = () => {
  const { occasionSlug } = useParams();
  const navigate = useNavigate();
  const builder = useHamperBuilder();
  const occasion = getOccasion(builder.occasionId);

  // A slug in the URL wins over whatever the saved draft had.
  useEffect(() => {
    if (!occasionSlug) return;
    const fromSlug = getOccasionBySlug(occasionSlug);
    if (fromSlug) builder.setOccasion(fromSlug.id);
    else navigate('/hampers', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occasionSlug]);

  useEffect(() => {
    const oldTitle = document.title;
    document.title = occasion
      ? `${occasion.name} Gift Hampers | NutriJewel`
      : 'Gift Hampers | Build Your Own | NutriJewel';
    return () => { document.title = oldTitle; };
  }, [occasion]);

  return (
    <div
      className="hampers-page"
      style={occasion ? { '--page-accent': occasion.accent } : undefined}
    >
      <HamperHero />
      <OccasionRail occasionId={builder.occasionId} onSelect={builder.setOccasion} />
      <PresetHamperGrid occasionId={builder.occasionId} builder={builder} />

      <section
        className="nj-builder-section"
        aria-labelledby="nj-builder-title"
      >
        <div className="container">
          <div className="nj-section-head">
            <h2 className="nj-section-title" id="nj-builder-title">Build your own hamper</h2>
            <p className="nj-section-sub">
              Choose a box, fill it however you like, and watch your price and savings update
              as you go. Nothing is ordered until you say so.
            </p>
          </div>
          <HamperBuilder builder={builder} />
        </div>
      </section>

      <HamperOffersStrip />
      <CorporateBulkCTA />
      <HamperFAQ />
    </div>
  );
};

export default HampersPage;
