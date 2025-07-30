import React from 'react';
import { Clock, Users, ChefHat, BookOpen, Heart, Share2, Calendar } from 'lucide-react';
import './RecipesBlogPage.css';

const RecipesBlogPage = () => {
  const content = [
    {
      id: 1,
      type: "recipe",
      title: "NutriJewel Granola Breakfast Bowl",
      description: "Start your day right with our signature granola topped with fresh fruits and nuts - a perfect nutritious breakfast.",
      image: "/images/granola.png",
      cookTime: "10 mins",
      servings: "2 people",
      difficulty: "Easy",
      ingredients: [
        "1 cup NJ Signature Granola",
        "1 cup Greek yogurt",
        "1 banana (sliced)",
        "1/2 cup mixed berries",
        "2 tbsp honey or maple syrup",
        "1/4 cup chopped almonds",
        "Fresh mint leaves"
      ],
      instructions: [
        "In a bowl, add Greek yogurt as the base",
        "Top generously with NJ Signature Granola",
        "Arrange sliced banana and berries on top",
        "Sprinkle chopped almonds for extra crunch",
        "Drizzle with honey or maple syrup",
        "Garnish with fresh mint leaves",
        "Serve immediately and enjoy!"
      ],
      tags: ["Breakfast", "High Fiber", "Protein-Rich"],
      author: "Dt. Ruchika Bachwani - Certified Pharmacist, Dietitian & Nutritionist",
      date: "2024-01-15"
    },
    {
      id: 2,
      type: "blog",
      title: "5 Benefits of Refined Sugar-Free Living",
      description: "Discover how eliminating refined sugar from your diet can transform your health and energy levels.",
      image: "/images/blissbites.png",
      readTime: "6 min read",
      category: "Nutrition Tips",
      content: "Refined sugar is hidden in many foods we consume daily. By choosing sugar-free alternatives like our NJ products, you can experience improved energy, better sleep, clearer skin, and stable blood sugar levels. Let's explore how to make this transition naturally...",
      tags: ["Sugar-Free", "Health Tips", "Clean Eating"],
      author: "Dt. Ruchika Bachwani - Certified Pharmacist, Dietitian & Nutritionist",
      date: "2024-01-10"
    },
    {
      id: 3,
      type: "recipe",
      title: "Energy-Boosting Bliss Bites Smoothie",
      description: "Blend our Bliss Bites with fruits to create a protein-packed smoothie perfect for post-workout recovery.",
      image: "/images/blissbites.png",
      cookTime: "5 mins",
      servings: "1 large glass",
      difficulty: "Very Easy",
      ingredients: [
        "2-3 NJ Bliss Bites",
        "1 banana",
        "1 cup almond milk",
        "1 tbsp almond butter",
        "1/2 tsp cinnamon",
        "1 cup ice cubes",
        "1 tsp vanilla extract"
      ],
      instructions: [
        "Crumble the Bliss Bites into small pieces",
        "Add all ingredients to a high-speed blender",
        "Blend until smooth and creamy",
        "Add more almond milk if needed for consistency",
        "Pour into a large glass",
        "Garnish with a sprinkle of cinnamon",
        "Enjoy immediately for best taste!"
      ],
      tags: ["Post-Workout", "Protein", "Quick Recipe"],
      author: "Dt. Ruchika Bachwani - Certified Pharmacist, Dietitian & Nutritionist",
      date: "2024-01-12"
    },
    {
      id: 4,
      type: "blog",
      title: "The Power of Ragi: Ancient Grain, Modern Benefits",
      description: "Learn why ragi (finger millet) is considered a superfood and how our Ragi Sattva brings these benefits to your table.",
      image: "/images/ragisattva.png",
      readTime: "7 min read",
      category: "Superfoods",
      content: "Ragi, also known as finger millet, has been a staple in Indian cuisine for centuries. Rich in calcium, iron, and fiber, this gluten-free grain supports bone health, aids digestion, and helps maintain stable blood sugar. Our NJ Ragi Sattva makes it easy to incorporate this superfood into your daily routine...",
      tags: ["Ragi", "Superfoods", "Gluten-Free"],
      author: "Dt. Ruchika Bachwani - Certified Pharmacist, Dietitian & Nutritionist",
      date: "2024-01-08"
    },
    {
      id: 5,
      type: "recipe",
      title: "Healthy Chocolate Cake Recipe",
      description: "Recreate the magic of our Cambridge Cake at home with this guilt-free, nutrient-dense chocolate cake recipe.",
      image: "/images/fresh batch of cambridge of chocolate cake.jpeg",
      cookTime: "45 mins",
      servings: "8 slices",
      difficulty: "Medium",
      ingredients: [
        "1 1/2 cups whole wheat flour",
        "1/2 cup unsweetened cocoa powder",
        "1 cup coconut sugar",
        "1/2 cup chopped walnuts",
        "1/2 cup coconut oil (melted)",
        "1 cup almond milk",
        "1 tsp vanilla extract",
        "1 tsp baking soda",
        "Pinch of sea salt"
      ],
      instructions: [
        "Preheat oven to 350°F (175°C)",
        "Mix all dry ingredients in a large bowl",
        "In another bowl, whisk wet ingredients",
        "Combine wet and dry ingredients gently",
        "Fold in chopped walnuts",
        "Pour into greased 9-inch cake pan",
        "Bake for 35-40 minutes until toothpick comes clean",
        "Cool completely before serving"
      ],
      tags: ["Healthy Dessert", "Eggless", "Refined Sugar-Free"],
      author: "Dt. Ruchika Bachwani - Certified Pharmacist, Dietitian & Nutritionist",
      date: "2024-01-05"
    },
    {
      id: 6,
      type: "blog",
      title: "Creating a Sustainable Healthy Lifestyle",
      description: "Small changes that make a big difference in your journey toward lasting health and wellness.",
      image: "/images/workshopsession.jpeg",
      readTime: "8 min read", 
      category: "Lifestyle",
      content: "True health isn't about perfect diets or intense workouts - it's about creating sustainable habits that nourish your body and mind. From meal planning with wholesome snacks like our NutriJewel products to mindful eating practices, discover how to build a lifestyle that supports your long-term wellness goals...",
      tags: ["Lifestyle", "Sustainability", "Wellness"],
      author: "Dt. Ruchika Bachwani - Certified Pharmacist, Dietitian & Nutritionist",
      date: "2024-01-03"
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
              <div key={item.id} className="content-card" data-type={item.type} onClick={() => setSelectedContent(item)}>
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
