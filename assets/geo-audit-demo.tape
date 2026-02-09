# geo-audit Demo
# Run: cd geokit && CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" vhs assets/geo-audit-demo.tape

Output assets/geo-audit-demo.gif

Set Shell "bash"
Set FontSize 15
Set Width 1100
Set Height 650
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 35ms
Set WindowBar Colorful
Set WindowBarSize 40

# 1. Full audit with score + recommendations
Type "# @glincker/geo-audit — AI-readiness audit"
Enter
Sleep 600ms

Type "npx geo-audit https://stripe.com"
Enter
Sleep 12s

# 2. JSON output for CI pipelines
Type ""
Enter
Type "# JSON output for CI/CD integration"
Enter
Sleep 600ms

Type "npx geo-audit https://stripe.com --json | head -15"
Enter
Sleep 10s

# 3. CI gate with --fail-under
Type ""
Enter
Type "# Use --fail-under to gate CI builds"
Enter
Sleep 600ms

Type "npx geo-audit https://stripe.com --fail-under 50 && echo 'Passed!'"
Enter
Sleep 10s

Sleep 3s
