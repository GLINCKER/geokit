# GeoKit Demo — Main README GIF
# Run: cd geokit && CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" vhs demo.tape

Output assets/demo.gif

Set Shell "bash"
Set FontSize 15
Set Width 1200
Set Height 750
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 30ms
Set WindowBar Colorful
Set WindowBarSize 40

# 1. Audit a site
Type "# Audit any website for AI-readiness"
Enter
Sleep 600ms

Type "npx geo-audit https://stripe.com"
Enter
Sleep 12s

# 2. Convert a URL to markdown
Type ""
Enter
Type "# Convert any URL to clean markdown"
Enter
Sleep 600ms

Type "npx geomark https://stripe.com --json | head -20"
Enter
Sleep 8s

# 3. Auto-fix pipeline
Type ""
Enter
Type "# Auto-fix: audit + generate missing GEO files"
Enter
Sleep 600ms

Type "npx geokit fix https://stripe.com --out /tmp/geo-fixes"
Enter
Sleep 12s

# 4. Framework adapters
Type ""
Enter
Type "# Framework adapters for Next.js, Vite, Astro, Nuxt"
Enter
Sleep 600ms

Type "cat <<EOF"
Enter
Type "import { withGeoSEO } from '@glincker/geo-seo/next'"
Enter
Type "import { geoSeoPlugin } from '@glincker/geo-seo/vite'"
Enter
Type "import { geoSeoIntegration } from '@glincker/geo-seo/astro'"
Enter
Type "import { geoSeoModule } from '@glincker/geo-seo/nuxt'"
Enter
Type "EOF"
Enter
Sleep 2s

# 5. End
Type ""
Enter
Type "# npm i @glincker/geokit  |  https://geo.glincker.com"
Enter
Sleep 3s
