// Data array: suggested energy-related activities
const energySuggestions = [
  {
    title: "Deep Sleep",
    description: "Aim for 7–9 hours of uninterrupted sleep to restore your baseline energy.",
    category: "Recovery",
    impact: "+40"
  },
  {
    title: "Focused Study Session",
    description: "A 60–90 minute deep work block with no distractions.",
    category: "Work / Study",
    impact: "-20"
  },
  {
    title: "Light Exercise",
    description: "20–30 minutes of walking, stretching, or yoga to boost mood.",
    category: "Movement",
    impact: "-10"
  },
  {
    title: "Social Break",
    description: "Chat with a friend or family member to recharge emotionally.",
    category: "Social",
    impact: "-15"
  },
  {
    title: "Quiet Time",
    description: "10–15 minutes of journaling, meditation, or just sitting quietly.",
    category: "Recovery",
    impact: "+10"
  }
];

// Get the container element (only exists on the Overview page)
const container = document.getElementById("content-container");

if (container) {
  energySuggestions.forEach(item => {
    // Create elements
    const card = document.createElement("article");
    card.classList.add("item");

    const title = document.createElement("h3");
    const desc = document.createElement("p");
    const meta = document.createElement("p");

    // Set content
    title.textContent = item.title;
    desc.textContent = item.description;
    meta.textContent = `${item.category} • impact on energy: ${item.impact}`;

    // Add helper class for meta text
    meta.classList.add("small");

    // Build structure
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(meta);

    // Append to container
    container.appendChild(card);
  });
}
