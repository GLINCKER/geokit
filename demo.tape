# GeoKit Demo — Terminal GIF for README
# Run: cd geokit && vhs demo.tape

Output demo.gif

Set Shell "bash"
Set FontSize 15
Set Width 1200
Set Height 700
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 35ms
Set WindowBar Colorful
Set WindowBarSize 40

# 1. Audit
Type "# Audit any website for AI-readiness"
Enter
Sleep 800ms

Type "npx geo-audit https://glincker.com"
Enter
Sleep 10s

# 2. Convert to markdown
Type ""
Enter
Type "# Convert any URL to clean markdown"
Enter
Sleep 800ms

Type "npx geomark https://glincker.com --no-meta | head -20"
Enter
Sleep 8s

# 3. Show adapters
Type ""
Enter
Type "# Adapters: Next.js, Vite, Astro, Nuxt"
Enter
Sleep 800ms

Type "cat <<EOF"
Enter
Type "import { geoSeoPlugin } from '@glincker/geo-seo/vite'"
Enter
Type "import { withGeoSEO } from '@glincker/geo-seo/next'"
Enter
Type "import { geoSeoIntegration } from '@glincker/geo-seo/astro'"
Enter
Type "import { geoSeoModule } from '@glincker/geo-seo/nuxt'"
Enter
Type "EOF"
Enter
Sleep 2s

# End
Type ""
Enter
Type "# npm i @glincker/geokit"
Enter
Sleep 3s
