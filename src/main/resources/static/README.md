# NBA-ZONE - Setup Instructions

## Adding Your Images

To add your NBA logo and other images to the website:

1. **Place your NBA logo** in the following directory:
   ```
   src/main/resources/static/images/
   ```

2. **Rename your logo file** to `nba-logo.png` (or update the filename in `index.html` line 23)

3. **Supported image formats**: PNG, JPG, SVG, WebP

## File Structure

```
src/main/resources/static/
├── index.html          # Main intro page
├── styles.css          # All styling and animations
├── script.js           # Interactive features
└── images/             # Place your images here
    └── nba-logo.png    # Your NBA logo goes here
```

## Running the Application

1. **Start the Spring Boot application**:
   ```bash
   ./mvnw spring-boot:run
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:8080
   ```

## Customizing the Design

### Colors
Edit the CSS variables in `styles.css` (lines 10-18):
- `--primary-blue`: Main blue color
- `--secondary-blue`: Lighter blue accent
- `--accent-blue`: Bright blue highlights
- `--bg-dark`: Main background color

### Text Content
Edit `index.html` to change:
- Title (line 36)
- Tagline (line 39)
- Button text (lines 42-43)
- Stats (lines 46-58)

### Animations
All animations are defined in `styles.css`:
- Logo pulse animation (lines 110-116)
- Floating circles (lines 60-71)
- Fade-in effects (lines 280-302)

## Next Steps

After adding your images, you can:
- Customize colors and fonts
- Add more sections below the intro
- Connect the buttons to actual pages
- Add more interactive features

Enjoy building NBA-ZONE! 🏀
