const db = require('./database.json');

console.log("=== WATER ID 4 (Chesil Beach - Legacy Format) ===");
const w4 = db.waters.find(w => w.id === 4);
console.log("Name:", w4.name);
console.log("Has bookingOptions:", 'bookingOptions' in w4);
console.log("bookingType:", w4.bookingType);
console.log("price:", w4.price);

console.log("\n=== WATER ID 5 (River Wye - Legacy Format) ===");
const w5 = db.waters.find(w => w.id === 5);
console.log("Name:", w5.name);
console.log("Has bookingOptions:", 'bookingOptions' in w5);
console.log("bookingType:", w5.bookingType);
console.log("price:", w5.price);

console.log("\n=== WATER ID 1 (River Test - New Multi-Option Format) ===");
const w1 = db.waters.find(w => w.id === 1);
console.log("Name:", w1.name);
console.log("Has bookingOptions:", 'bookingOptions' in w1);
console.log("Num options:", w1.bookingOptions.length);
console.log("First option:", w1.bookingOptions[0].name, "- category:", w1.bookingOptions[0].category);
console.log("bookingType:", w1.bookingType);
console.log("price (legacy):", w1.price);
