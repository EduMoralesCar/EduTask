const fs = require('fs');

function fixDashboard() {
  let content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
  content = content.replace(/<Grid size=\{\{ xs: , md:  \}\}>/g, '<Grid size={{ xs: 12, md: 3 }}>');
  content = content.replace(/<Grid size=\{\{ xs:  \}\}>/g, '<Grid size={{ xs: 12 }}>');
  content = content.replace(/<Grid size=\{\{ xs: , md: , lg:  \}\}/g, '<Grid size={{ xs: 12, md: 6, lg: 4 }}');
  fs.writeFileSync('src/pages/DashboardPage.tsx', content);
}

function fixProject() {
  let content = fs.readFileSync('src/pages/ProjectPage.tsx', 'utf8');
  // First 4 instances are md: 3
  let count = 0;
  content = content.replace(/<Grid size=\{\{ xs: , md:  \}\}>/g, (match) => {
    count++;
    if (count <= 4) return '<Grid size={{ xs: 12, md: 3 }}>';
    return '<Grid size={{ xs: 12, md: 6 }}>';
  });
  content = content.replace(/<Grid size=\{\{ xs:  \}\}>/g, '<Grid size={{ xs: 12 }}>');
  fs.writeFileSync('src/pages/ProjectPage.tsx', content);
}

fixDashboard();
fixProject();
