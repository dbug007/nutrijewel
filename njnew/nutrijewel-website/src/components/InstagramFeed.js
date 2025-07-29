import React from 'react';
import { Instagram, ExternalLink } from 'lucide-react';
import './InstagramFeed.css';

const InstagramFeed = () => {
  // Instagram posts featuring actual NutriJewel products and behind-the-scenes
  const instagramPosts = [
    {
      id: 1,
      image: '/images/fresh batch of cambridge of chocolate cake.jpeg',
      caption: 'Fresh batch of Cambridge Chocolate Cake straight from our kitchen! 🍰✨',
      likes: 187,
      date: '1 day ago'
    },
    {
      id: 2,
      image: '/images/ruchikaamritbites.jpeg',
      caption: 'Dt. Ruchika with her signature Amrit Bites - made with love & tradition ❤️',
      likes: 156,
      date: '2 days ago'
    },
    {
      id: 3,
      image: '/images/fresh oxford of love cake.jpeg',
      caption: 'Oxford of Love - fresh strawberry & dark chocolate perfection! 🍓🍫',
      likes: 203,
      date: '3 days ago'
    },
    {
      id: 4,
      image: '/images/hummuspitabread.jpeg',
      caption: 'Low-fat hummus paired perfectly with fresh pita bread! 🥙 Healthy never tasted so good',
      likes: 92,
      date: '5 days ago'
    },
    {
      id: 5,
      image: '/images/workshopsession.jpeg',
      caption: 'Teaching the art of healthy baking! 👩‍🍳 Join our next workshop to learn these secrets',
      likes: 134,
      date: '1 week ago'
    },
    {
      id: 6,
      image: '/images/packed cambridge of love cake.jpeg',
      caption: 'Ready to ship with love! 📦 Your favorite Cambridge cake, packed fresh',
      likes: 89,
      date: '1 week ago'
    }
  ];

  const handleInstagramClick = () => {
    window.open('https://instagram.com/nutrijewel', '_blank');
  };

  return (
    <section id="instagram" className="instagram-section">
      <div className="instagram-container">
        {/* Section Header */}
        <div className="instagram-header">
          <div className="instagram-title-wrapper">
            <Instagram className="instagram-title-icon" size={32} />
            <h2 className="instagram-title">Follow Our Journey</h2>
          </div>
          <p className="instagram-subtitle">
            Get inspired by our daily dose of healthy living, behind-the-scenes moments, and customer stories
          </p>
          <div className="instagram-divider"></div>
        </div>

        {/* Instagram Grid */}
        <div className="instagram-grid">
          {instagramPosts.map((post) => (
            <div 
              key={post.id} 
              className="instagram-post"
              onClick={handleInstagramClick}
            >
              <div className="instagram-image-wrapper">
                <img 
                  src={post.image} 
                  alt="NutriJewel Instagram Post"
                  className="instagram-image"
                  onError={(e) => {
                    e.target.src = '/images/granola.png';
                  }}
                />
                <div className="instagram-overlay">
                  <div className="instagram-overlay-content">
                    <Instagram className="instagram-overlay-icon" size={24} />
                    <span className="instagram-likes">❤️ {post.likes}</span>
                  </div>
                </div>
              </div>
              <div className="instagram-post-info">
                <p className="instagram-caption">{post.caption}</p>
                <span className="instagram-date">{post.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Follow Button */}
        <div className="instagram-cta">
          <button 
            onClick={handleInstagramClick}
            className="instagram-follow-btn"
          >
            <Instagram size={20} />
            <span>Follow @nutrijewel</span>
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
