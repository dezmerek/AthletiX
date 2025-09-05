const { MongoClient, ObjectId } = require("mongodb");

async function setPremium() {
  const client = new MongoClient(
    process.env.MONGODB_URI || "mongodb://localhost:27017/athletix"
  );

  try {
    await client.connect();
    const db = client.db();

    // Znajdź użytkownika po email (zastąp swoim emailem)
    const user = await db.collection("users").findOne({
      email: "your-email@example.com", // ZASTĄP SWOIM EMAILEM
    });

    if (!user) {
      console.log("User not found");
      return;
    }

    console.log("Found user:", user.email);

    // Ustaw isPremiumPersonal na true
    const result = await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          isPremiumPersonal: true,
          updatedAt: new Date(),
        },
      }
    );

    console.log("Updated:", result.modifiedCount > 0);
  } finally {
    await client.close();
  }
}

setPremium().catch(console.error);
