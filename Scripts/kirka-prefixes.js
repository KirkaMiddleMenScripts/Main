let linked_badge = false; // true or false
let booster_badge = false; // true or false
let type = "override"; // 'append' or 'override'

let badgeMapping = {};
let allIds = [];

async function fetchBadgeData() {
  const res = await fetch("https://opensheet.elk.sh/1fEctP3Xsg_mw2xk1_gEQVIeWLUAhnYH-8vZUApvJCDY/2");
  const sheetData = await res.json();

  sheetData.forEach(entry => {
    if (entry.id) {
      let badges = [];

      Object.keys(entry).forEach(key => {
        if (key.toLowerCase().includes("badge") && entry[key]) {
          badges.push(entry[key]);
        }
      });

      badgeMapping[entry.id] = badges;
      allIds.push(entry.id);
    }
  });
}

const originalFetch = window.fetch;

window.fetch = async function (...args) {
  if (args[0] === "https://juice-api.irrvlo.xyz/api/customizations") {
    const response = await originalFetch(...args);
    const clonedResponse = response.clone();
    let data = await clonedResponse.json();

    // Load badge data and all user IDs
    await fetchBadgeData();

    let updatedData = [];

    allIds.forEach(id => {
      let obj = {
        shortId: id,
        booster: booster_badge,
        badges: badgeMapping[id] || []
      };

      if (linked_badge) {
        obj.discord = "123"; // simulate Discord linking
      }

      updatedData.push(obj);
    });

    if (type === "override") {
      data = updatedData;
    } else if (type === "append") {
      data.push(...updatedData);
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  return originalFetch(...args);
};
