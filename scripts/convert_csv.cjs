const fs = require('fs');
const csv = fs.readFileSync('public/algeria_cities.csv', 'utf8');
const lines = csv.trim().split('\n').slice(1);
const wilayas = {};

for (const line of lines) {
  // Parse CSV handling quotes
  const matches = line.match(/("[^"]*"|[^,]+)(?=\s*,|\s*$)/g);
  if (!matches || matches.length < 5) continue;
  
  let [id, commune, daira, wilaya_code, wilaya_name] = matches.map(m => m.replace(/^"|"$/g, '').trim());
  
  if (!wilayas[wilaya_code]) {
    wilayas[wilaya_code] = { code: wilaya_code, name: wilaya_name, dairas: {} };
  }
  if (!wilayas[wilaya_code].dairas[daira]) {
    wilayas[wilaya_code].dairas[daira] = [];
  }
  wilayas[wilaya_code].dairas[daira].push(commune);
}

const result = Object.values(wilayas).map(w => ({
  code: w.code,
  name: w.name,
  dairas: Object.entries(w.dairas).map(([dName, communes]) => ({
    name: dName,
    communes: communes.sort()
  })).sort((a,b) => a.name.localeCompare(b.name, 'ar'))
})).sort((a,b) => parseInt(a.code) - parseInt(b.code));

fs.writeFileSync('src/lib/algeria_cities.json', JSON.stringify(result, null, 2));
console.log('Created src/lib/algeria_cities.json');
