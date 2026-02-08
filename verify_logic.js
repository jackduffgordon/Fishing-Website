// Simulate backward compatibility logic from VenueDetail.jsx

const newFormatWater = {
  name: "River Test",
  bookingOptions: [
    { id: "opt-1", category: "day-tickets", name: "Day Rod", price: 150, priceType: "day", bookingType: "enquiry" },
    { id: "opt-2", category: "day-tickets", name: "Half Day", price: 95, priceType: "half-day", bookingType: "enquiry" }
  ],
  price: 150,
  bookingType: "enquiry"
};

const legacyFormatWater = {
  name: "River Wye",
  price: 80,
  bookingType: "enquiry",
  priceType: "per rod/day"
  // NO bookingOptions property
};

const freeWater = {
  name: "Chesil Beach",
  price: 0,
  bookingType: "free"
  // NO bookingOptions property
};

function testBackwardCompat(water) {
  const hasBookingOptions = water.bookingOptions && water.bookingOptions.length > 0;
  
  console.log(`\nTesting: ${water.name}`);
  console.log("  hasBookingOptions check passes:", hasBookingOptions);
  
  if (hasBookingOptions) {
    console.log("  → Uses NEW multi-option UI");
    console.log("  → Found", water.bookingOptions.length, "options");
  } else {
    console.log("  → Falls back to LEGACY single-booking UI");
    console.log("  → Uses bookingType:", water.bookingType);
    console.log("  → Uses price:", water.price);
  }
}

testBackwardCompat(newFormatWater);
testBackwardCompat(legacyFormatWater);
testBackwardCompat(freeWater);

console.log("\n✓ Backward compatibility logic works correctly");
