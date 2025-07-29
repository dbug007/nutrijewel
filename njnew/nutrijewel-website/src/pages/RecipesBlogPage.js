import React from 'react';
import { Clock, Users, ChefHat, BookOpen, Heart, Share2, Calendar } from 'lucide-react';
import './RecipesBlogPage.css';

const RecipesBlogPage = () => {
  const content = [
    {
      id: 1,
      type: "recipe",
      title: "Protein-Rich Quinoa Bowl",
      description: "A nutritious and filling bowl packed with plant-based proteins, perfect for lunch or dinner.",
      image: "/images/recipe1.jpg",
      cookTime: "25 mins",
      servings: "2 people",
      difficulty: "Easy",
      ingredients: [
        "1 cup quinoa",
        "1 can black beans",
        "1 avocado",
        "2 cups spinach",
        "1/2 cup cherry tomatoes",
        "2 tbsp olive oil",
        "Lime juice",
        "Salt and pepper"
      ],
      instructions: [
        "Cook quinoa according to package instructions",
        "Rinse and drain black beans",
        "Wash and chop all vegetables",
        "Assemble bowl with quinoa as base",
        "Add beans, vegetables, and avocado",
        "Drizzle with olive oil and lime juice",
        "Season with salt and pepper"
      ],
      tags: ["Vegan", "High Protein", "Gluten-Free"],
      author: "Dt. Ruchika Bachwani",
      date: "2024-01-15"
    },
    {
      id: 2,
      type: "blog",
      title: "5 Myths About Healthy Eating Debunked",
      description: "Common misconceptions about nutrition that might be holding you back from achieving your health goals.",
      image: "/images/blog1.jpg",
      readTime: "5 min read",
      category: "Nutrition Tips",
      content: "Many people believe that healthy eating is complicated, expensive, or tasteless. Let's debunk these myths and make nutrition simple and enjoyable...",
      tags: ["Nutrition", "Health Tips", "Myths"],
      author: "Dt. Ruchika Bachwani",
      date: "2024-01-10"
    },
    {
      id: 3,
      type: "recipe",
      title: "No-Bake Energy Balls",
      description: "Quick and easy energy balls made with dates, nuts, and seeds - perfect for a healthy snack.",
      image: "/images/recipe2.jpg",
      cookTime: "15 mins",
      servings: "12 balls",
      difficulty: "Very Easy",
      ingredients: [
        "1 cup dates (pitted)",
        "1/2 cup almonds",
        "1/4 cup chia seeds",
        "2 tbsp coconut oil",
        "1 tsp vanilla extract",
        "Coconut flakes for rolling"
      ],
      instructions: [
        "Soak dates in warm water for 10 minutes",
        "Blend dates until smooth paste forms",
        "Add almonds and pulse until roughly chopped",
        "Mix in chia seeds, coconut oil, and vanilla",
        "Roll mixture into small balls",
        "Roll in coconut flakes",
        "Refrigerate for 30 minutes before serving"
      ],
      tags: ["No-Bake", "Energy Snack", "Vegan"],
      author: "Dt. Ruchika Bachwani",
      date: "2024-01-12"
    },
    {
      id: 4,
      type: "blog",
      title: "The Science Behind Intermittent Fasting",
      description: "Understanding how intermittent fasting works and whether it's right for your lifestyle and health goals.",
      image: "/images/blog2.jpg",
      readTime: "8 min read",
      category: "Diet Trends",
      content: "Intermittent fasting has gained popularity, but what does science say about its benefits and risks? Let's explore the evidence...",
      tags: ["Intermittent Fasting", "Science", "Weight Loss"],
      author: "Dt. Ruchika Bachwani",
      date: "2024-01-08"
    }
  ];

  const [selectedFilter, setSelectedFilter] = React.useState("All");
  const [selectedContent, setSelectedContent] = React.useState(null);
  
  const filters = ["All", "Recipes", "Blog Posts"];

  const filteredContent = selectedFilter === "All" 
    ? content 
    : content.filter(item => selectedFilter === "Recipes" ? item.type === "recipe" : item.type === "blog");

  const handleShareContent = (title) => {
    const message = `Check out this amazing ${selectedContent?.type || 'content'}: "${title}" from NutriJewel!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="recipes-blog-page">
      {/* Header Section */}
      <section className="content-header">
        <div className="content-container">
          <h1 className="content-title">
            Recipes & <span className="content-title-green">Health Blog</span>
          </h1>
          <p className="content-subtitle">
            Discover delicious healthy recipes and expert nutrition insights to fuel your wellness journey
          </p>
          <div className="content-divider"></div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="content-filters">
        <div className="content-container">
          <div className="filter-buttons">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`filter-btn ${selectedFilter === filter ? 'active' : ''}`}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter === "Recipes" && <ChefHat size={18} />}
                {filter === "Blog Posts" && <BookOpen size={18} />}
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="content-grid-section">
        <div className="content-container">
          <div className="content-grid">
            {filteredContent.map((item) => (
              <div key={item.id} className="content-card" onClick={() => setSelectedContent(item)}>
                <div className="content-image-wrapper">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="content-image"
                  />
                  <div className="content-overlay">
                    <div className="content-type-badge">
                      {item.type === 'recipe' ? <ChefHat size={16} /> : <BookOpen size={16} />}
                      {item.type === 'recipe' ? 'Recipe' : 'Blog'}
                    </div>
                  </div>
                </div>

                <div className="content-body">
                  <div className="content-meta">
                    <div className="meta-info">
                      {item.type === 'recipe' ? (
                        <>
                          <span className="meta-item">
                            <Clock size={14} />
                            {item.cookTime}
                          </span>
                          <span className="meta-item">
                            <Users size={14} />
                            {item.servings}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="meta-item">
                            <Clock size={14} />
                            {item.readTime}
                          </span>
                          <span className="meta-item">
                            <BookOpen size={14} />
                            {item.category}
                          </span>
                        </>
                      )}
                    </div>
                    <button 
                      className="share-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareContent(item.title);
                      }}
                    >
                      <Share2 size={16} />
                    </button>
                  </div>

                  <h3 className="content-card-title">{item.title}</h3>
                  <p className="content-card-description">{item.description}</p>

                  <div className="content-tags">
                    {item.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="content-tag">{tag}</span>
                    ))}
                  </div>

                  <div className="content-footer">
                    <div className="author-info">
                      <span className="author-name">{item.author}</span>
                      <span className="content-date">
                        <Calendar size={12} />
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <button className="read-more-btn">
                      {item.type === 'recipe' ? 'View Recipe' : 'Read More'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Modal/Detail View */}
      {selectedContent && (
        <div className="content-modal" onClick={() => setSelectedContent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedContent(null)}>×</button>
            
            <div className="modal-header">
              <img 
                src={selectedContent.image} 
                alt={selectedContent.title}
                className="modal-image"
              />
              <div className="modal-info">
                <div className="modal-type-badge">
                  {selectedContent.type === 'recipe' ? <ChefHat size={16} /> : <BookOpen size={16} />}
                  {selectedContent.type === 'recipe' ? 'Recipe' : 'Blog Post'}
                </div>
                <h2 className="modal-title">{selectedContent.title}</h2>
                <p className="modal-description">{selectedContent.description}</p>
                
                <div className="modal-meta">
                  {selectedContent.type === 'recipe' ? (
                    <>
                      <span><Clock size={16} /> {selectedContent.cookTime}</span>
                      <span><Users size={16} /> {selectedContent.servings}</span>
                      <span>Difficulty: {selectedContent.difficulty}</span>
                    </>
                  ) : (
                    <>
                      <span><Clock size={16} /> {selectedContent.readTime}</span>
                      <span><BookOpen size={16} /> {selectedContent.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-body">
              {selectedContent.type === 'recipe' ? (
                <div className="recipe-content">
                  <div className="recipe-section">
                    <h3>Ingredients:</h3>
                    <ul className="ingredients-list">
                      {selectedContent.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="recipe-section">
                    <h3>Instructions:</h3>
                    <ol className="instructions-list">
                      {selectedContent.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="blog-content">
                  <p>{selectedContent.content}</p>
                  <p>This is a preview of the blog post. The full article would contain more detailed information about the topic...</p>
                </div>
              )}

              <div className="modal-tags">
                {selectedContent.tags.map((tag, index) => (
                  <span key={index} className="modal-tag">{tag}</span>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <div className="modal-author">
                <span>By {selectedContent.author}</span>
                <span>{new Date(selectedContent.date).toLocaleDateString()}</span>
              </div>
              <button 
                className="modal-share-btn"
                onClick={() => handleShareContent(selectedContent.title)}
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Signup */}
      <section className="content-newsletter">
        <div className="content-container">
          <div className="newsletter-content">
            <h2>Get Fresh Recipes & Health Tips</h2>
            <p>Subscribe to receive our latest recipes and nutrition insights directly in your inbox</p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="newsletter-input"
              />
              <button className="newsletter-btn">
                <Heart size={18} />
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RecipesBlogPage;
