# geo-seo Demo
# Run: cd geokit && CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" vhs assets/geo-seo-demo.tape

Output assets/geo-seo-demo.gif

Set Shell "bash"
Set FontSize 15
Set Width 1100
Set Height 650
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 35ms
Set WindowBar Colorful
Set WindowBarSize 40

# 1. Create config
Type "# @glincker/geo-seo — Generate GEO assets"
Enter
Sleep 600ms

Type "npx geo-seo init"
Enter
Sleep 5s

# 2. Show the generated config
Type "head -20 geo-seo.config.ts"
Enter
Sleep 3s

# 3. Generate all assets
Type ""
Enter
Type "# Generate llms.txt, robots.txt, sitemap.xml"
Enter
Sleep 600ms

Type "npx geo-seo generate --config geo-seo.config.ts --out /tmp/geo-seo-demo"
Enter
Sleep 5s

# 4. Show generated files
Type "ls -la /tmp/geo-seo-demo/"
Enter
Sleep 2s

Type ""
Enter
Type "# Preview llms.txt"
Enter
Sleep 500ms

Type "cat /tmp/geo-seo-demo/llms.txt"
Enter
Sleep 3s

# 5. Generate only one file
Type ""
Enter
Type "# Generate just one file type"
Enter
Sleep 500ms

Type "npx geo-seo generate --config geo-seo.config.ts --only llms-txt --out /tmp/geo-seo-demo"
Enter
Sleep 5s

Sleep 3s
