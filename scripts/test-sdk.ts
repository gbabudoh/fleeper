import "dotenv/config";
import Fleeper from "@fleeper/sdk";

async function main() {
  console.log("🚀 Testing @fleeper/sdk...");

  // Testing with the API key created during our earlier DB setup
  const sdk = new Fleeper("flp_83fa7948e7f13e2040e4017b6a7c7830c7421e27", {
    baseUrl: "http://localhost:3000/api/v1"
  });

  try {
    const slug = `sdk-invoice-${Math.random().toString(36).substring(2, 6)}`;
    
    console.log(`📡 Creating link: ${slug}`);
    
    // This perfectly matches the snippet shown on the landing page
    const link = await sdk.links.create({
      title: "Design Invoice #42",
      amount: 150000, // cents
      slug,
      pools: [
        { label: "Revenue",   percent: 70 },
        { label: "Tax Vault", percent: 20 },
        { label: "Growth",    percent: 10 },
      ],
    });

    console.log("✅ SDK create successful!");
    console.log("-----------------------");
    console.log(JSON.stringify(link, null, 2));
    console.log("-----------------------");

    console.log("\n📡 Listing links via SDK...");
    const listResponse = await sdk.links.list();
    console.log(`✅ SDK list successful! Found ${listResponse.links?.length || 0} links.`);

  } catch (err) {
    console.error("❌ SDK test failed:", err);
  }
}

main();
