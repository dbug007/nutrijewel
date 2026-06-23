# Verification Scripts

This folder contains helper scripts for verifying nutrition facts.

## verify-usda.js

Requirements:
- Node.js 18+
- USDA_API_KEY environment variable

Run:
```
source ~/.zshrc
node scripts/verify-usda.js
```

Outputs:
- sources/nutrition-sources.json (source map)
- sources/usda-review.csv (flagged USDA comparisons)
- sources/usda-missing.csv (items needing label sources)
