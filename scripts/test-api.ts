const API_KEY = "flp_83fa7948e7f13e2040e4017b6a7c7830c7421e27";
const BASE_URL = "http://localhost:3000/api/v1";

async function test() {
  console.log("🚀 Testing Fleeper V1 API...");

  try {
    const res = await fetch(`${BASE_URL}/links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        title: "Design Invoice #42",
        amount: 150000,
        isFlexible: false,
        slug: `invoice-${Math.floor(Math.random() * 10000)}`,
        pools: [
          { label: "Revenue",   percent: 70 },
          { label: "Tax Vault", percent: 20 },
          { label: "Growth",    percent: 10 },
        ],
      })
    });

    console.log(`📡 Status: ${res.status}`);
    const text = await res.text();
    console.log(`📄 Response: ${text}`);

    if (res.ok) {
      const data = JSON.parse(text);
      console.log("✅ Link created successfully!");
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log("❌ Failed to create link");
    }

    // Test GET links
    console.log("\n🚀 Fetching all links...");
    const getRes = await fetch(`${BASE_URL}/links`, {
      headers: { "Authorization": `Bearer ${API_KEY}` }
    });
    const dataGet = await getRes.json();
    console.log(`✅ Found ${dataGet.links?.length || 0} links`);

  } catch (error) {
    console.error("💥 Error during test:", error);
  }
}

test();
