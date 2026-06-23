# FDA Nutrition Label Generator

A simple web application for generating FDA-compliant nutrition facts labels from recipe ingredients.

## Features

- 📊 **FDA-Compliant Labels**: Generate nutrition facts labels that follow FDA formatting guidelines
- 🧮 **Automatic Calculations**: Calculate nutrition values based on ingredient amounts
- 📏 **Serving Size Management**: Adjust serving sizes and servings per container
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 📄 **Multiple Export Options**: Download as PNG, PDF, or get embed code
- 🥗 **Ingredient Database**: Built-in database with common ingredients

## Getting Started

### Prerequisites

- A web server (Apache, Nginx, or simple PHP server)
- Modern web browser with JavaScript enabled

### Installation

1. Clone or download this repository
2. Place files in your web server directory
3. Open `index.html` in your browser

### Using PHP Development Server

```bash
# Navigate to project directory
cd "FDA nutrition label generator"

# Start PHP development server
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

## Usage

### Adding Ingredients

1. Click "Add Ingredient" to add ingredient inputs
2. Select ingredients from the dropdown menu
3. Enter amounts and select appropriate units
4. Remove ingredients using the "Remove" button

### Setting Serving Information

1. Enter serving size (e.g., 1, 0.5, 2)
2. Select serving unit (cup, tablespoon, etc.)
3. Set servings per container

### Generating Labels

1. Click "Calculate Nutrition" to generate the label
2. The FDA nutrition facts label will update automatically
3. All values are rounded according to FDA guidelines

### Exporting Labels

- **PNG**: Download high-resolution image
- **PDF**: Download printable PDF document
- **Embed Code**: Get HTML/CSS code to embed on websites

## FDA Compliance

This generator follows FDA nutrition labeling guidelines:

- Proper rounding rules for all nutrients
- Correct daily value calculations based on 2000-calorie diet
- Standard nutrition facts format and styling
- Required nutrients in proper order

## Ingredient Database

Includes nutritional data for common ingredients:

- Grains & cereals
- Dairy & eggs
- Fruits & vegetables
- Proteins (meat, fish)
- Oils & fats
- Sweeteners
- Nuts & seeds

## Technical Details

### Built With

- **HTML5** - Structure and semantic markup
- **CSS3** - Styling and FDA-compliant label formatting
- **Vanilla JavaScript** - Application logic and calculations
- **html2canvas** - PNG export functionality
- **jsPDF** - PDF export functionality

### File Structure

```
├── index.html              # Main application page
├── styles/
│   ├── main.css           # General application styles
│   └── nutrition-label.css # FDA nutrition label styles
├── js/
│   ├── nutrition-data.js   # Ingredient database
│   ├── nutrition-calculator.js # Calculation logic
│   ├── label-generator.js  # Label display logic
│   ├── export-handler.js   # Export functionality
│   └── main.js            # Main application logic
└── README.md              # This file
```

## Adding New Ingredients

To add new ingredients to the database, edit `js/nutrition-data.js`:

```javascript
'new-ingredient-id': {
    name: 'Ingredient Name',
    calories: 100,        // per 100g
    totalFat: 1.0,       // grams per 100g
    // ... other nutrients
}
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

This project is open source and available under the [MIT License](LICENSE).

## Disclaimer

This tool is for educational and personal use. For commercial food labeling, please consult with regulatory authorities and conduct professional nutritional analysis.
