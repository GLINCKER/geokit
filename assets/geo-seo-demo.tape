# geo-seo Demo
# Run: cd geokit && CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" vhs assets/geo-seo-demo.tape

Output assets/geo-seo-demo.gif

Set Shell "bash"
Set FontSize 15
Set Width 1100
Set Height 600
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 40ms
Set WindowBar Colorful
Set WindowBarSize 40

Type "# @glincker/geo-seo — Generate GEO assets"
Enter
Sleep 800ms

Type "npx geo-seo generate --out /tmp/geo-seo-demo"
Enter
Sleep 5s

Type "ls -la /tmp/geo-seo-demo/"
Enter
Sleep 2s

Type ""
Enter
Type "# llms.txt — Tell AI about your site"
Enter
Sleep 500ms

Type "cat /tmp/geo-seo-demo/llms.txt"
Enter
Sleep 3s

Type ""
Enter
Type "# Works with Next.js, Vite, Astro, Nuxt"
Enter
Sleep 3s
