# geomark Demo
# Run: cd geokit && CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" vhs assets/geomark-demo.tape

Output assets/geomark-demo.gif

Set Shell "bash"
Set FontSize 15
Set Width 1100
Set Height 600
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 40ms
Set WindowBar Colorful
Set WindowBarSize 40

Type "# @glincker/geomark — URL to clean markdown"
Enter
Sleep 800ms

Type "npx geomark https://glincker.com"
Enter
Sleep 10s

Type ""
Enter
Type "# JSON output with metadata and token count"
Enter
Sleep 800ms

Type "npx geomark https://glincker.com --json | head -30"
Enter
Sleep 8s

Type ""
Enter
Sleep 2s
