// Logo replacement script - Run this in the backend directory
const fs = require('fs');
const path = require('path');

const oldLogoImg = `<img src={logo} alt="WasteZero Logo" width="40" height="40" />`;
const newLogoSVG = `<img src={logo} alt="WasteZero Logo" width="40" height="40" />`;

const componentsDir = path.join(__dirname, '../frontend/src/components');
const files = [
  'Notifications.js',
  'Messages.js',
  'Profile.js',
  'Opportunities.js',
  'SchedulePickup.js',
  'CreateOpportunity.js',
  'EditOpportunity.js',
  'OpportunityDetails.js'
];

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const count = (content.match(new RegExp(oldLogoImg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    content = content.split(oldLogoImg).join(newLogoSVG);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${file} - ${count} replacements`);
  } else {
    console.log(`❌ File not found: ${file}`);
  }
});

console.log('🎉 Logo replacement complete!');
