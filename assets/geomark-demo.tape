# geomark Demo
# Run: cd geokit && CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" vhs assets/geomark-demo.tape

Output assets/geomark-demo.gif

Set Shell "bash"
Set FontSize 15
Set Width 1100
Set Height 650
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 35ms
Set WindowBar Colorful
Set WindowBarSize 40

# 1. Convert URL to markdown
Type "# @glincker/geomark — URL to clean markdown"
Enter
Sleep 600ms

Type "npx geomark https://stripe.com | head -30"
Enter
Sleep 10s

# 2. JSON with metadata + token count
Type ""
Enter
Type "# JSON output with metadata and token estimate"
Enter
Sleep 600ms

Type "npx geomark https://stripe.com --json | head -25"
Enter
Sleep 8s

# 3. Frontmatter for LLM context
Type ""
Enter
Type "# YAML frontmatter for LLM context windows"
Enter
Sleep 600ms

Type "npx geomark https://stripe.com --frontmatter | head -15"
Enter
Sleep 8s

Sleep 3s
