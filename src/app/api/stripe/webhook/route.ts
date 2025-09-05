import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    console.log("=== WEBHOOK RECEIVED ===");
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    console.log("Signature:", signature ? "Present" : "Missing");
    console.log("Body length:", body.length);
    console.log("Webhook secret set:", !!process.env.STRIPE_WEBHOOK_SECRET);

    if (!signature) {
      console.log("No signature provided");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;

        console.log("Checkout session completed:", {
          userId,
          planType,
          sessionId: session.id,
          subscription: session.subscription,
        });

        if (!userId || !planType) {
          console.error("Missing metadata in checkout session");
          break;
        }

        // Update user's premium status and roles based on plan type
        const updateData: any = {};
        if (planType === "client") {
          updateData.isPremiumPersonal = true;
        } else if (planType === "professional") {
          updateData.isPremiumProfessional = true;
        }
        // Note: For business plans, we update both users (roles) and businesses collections

        // Update user's premium status
        const updateResult = await db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              ...updateData,
              updatedAt: new Date(),
            },
          }
        );

        // For business plan, add business_owner role and create/update business record
        if (planType === "business") {
          // Add business_owner role to user
          await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            {
              $addToSet: { role: "business_owner" },
              $set: { updatedAt: new Date() }
            }
          );

          let existingBusiness = null;
          try {
            existingBusiness = await db.collection("businesses").findOne({
              ownerId: new ObjectId(userId),
            });
          } catch (error) {
            console.error("Error finding existing business:", error);
            // Continue to create new business if there's an error
          }

          if (existingBusiness) {
            // Update existing business
            await db.collection("businesses").updateOne(
              { _id: existingBusiness._id },
              {
                $set: {
                  isPremiumBusiness: true,
                  updatedAt: new Date(),
                },
              }
            );
            console.log(
              "Business premium status updated for business:",
              existingBusiness._id
            );
          } else {
            // Get user data from database
            const userData = await db.collection("users").findOne({
              _id: new ObjectId(userId),
            });

            // Create new business
            const newBusiness = {
              name: "Moja Firma", // Default name, user can change later
              email: userData?.email || "",
              phone: "",
              address: "",
              ownerId: new ObjectId(userId),
              createdAt: new Date(),
              updatedAt: new Date(),
              subscription: {
                plan: "pro",
                status: "active",
                startDate: new Date(),
              },
              settings: {
                timezone: "Europe/Warsaw",
                currency: "PLN",
                notifications: {
                  email: true,
                  sms: false,
                },
              },
              staff: [],
              members: [],
              isPremiumBusiness: true,
            };

            const result = await db
              .collection("businesses")
              .insertOne(newBusiness);
            console.log(
              "New business created with premium status:",
              result.insertedId
            );
          }
        }

        console.log("User update result:", {
          matchedCount: updateResult.matchedCount,
          modifiedCount: updateResult.modifiedCount,
          updateData,
        });

        // Store subscription info
        if (session.subscription) {
          await db.collection("subscriptions").insertOne({
            userId: new ObjectId(userId),
            stripeSubscriptionId: session.subscription as string,
            planType: planType,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        console.log(`User ${userId} subscribed to ${planType} plan`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const planType = subscription.metadata?.planType;

        if (!userId || !planType) {
          console.error("Missing metadata in subscription");
          break;
        }

        const isActive = subscription.status === "active";

        // Update user's premium status
        const updateData: any = {};
        if (planType === "client") {
          updateData.isPremiumPersonal = isActive;
        } else if (planType === "professional") {
          updateData.isPremiumProfessional = isActive;
        }
        // Note: For business plans, we only update the businesses collection, not users

        await db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              ...updateData,
              updatedAt: new Date(),
            },
          }
        );

        // For business plan, update user role and business record
        if (planType === "business") {
          // Update user role based on subscription status
          if (isActive) {
            await db.collection("users").updateOne(
              { _id: new ObjectId(userId) },
              {
                $addToSet: { role: "business_owner" },
                $set: { updatedAt: new Date() }
              }
            );
          } else {
            await db.collection("users").updateOne(
              { _id: new ObjectId(userId) },
              {
                $pull: { role: "business_owner" },
                $set: { updatedAt: new Date() }
              }
            );
          }

          let business = null;
          try {
            business = await db.collection("businesses").findOne({
              ownerId: new ObjectId(userId),
            });
          } catch (error) {
            console.error(
              "Error finding business for subscription update:",
              error
            );
          }

          if (business) {
            await db.collection("businesses").updateOne(
              { _id: business._id },
              {
                $set: {
                  isPremiumBusiness: isActive,
                  updatedAt: new Date(),
                },
              }
            );
            console.log(
              "Business premium status updated for business:",
              business._id
            );
          } else {
            console.log(
              "No business found for user during subscription update:",
              userId
            );
          }
        }

        // Update subscription status
        await db.collection("subscriptions").updateOne(
          { stripeSubscriptionId: subscription.id },
          {
            $set: {
              status: subscription.status,
              updatedAt: new Date(),
            },
          }
        );

        console.log(
          `User ${userId} subscription updated: ${subscription.status}`
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const planType = subscription.metadata?.planType;

        if (!userId || !planType) {
          console.error("Missing metadata in subscription");
          break;
        }

        // Update user's premium status to false
        const updateData: any = {};
        if (planType === "client") {
          updateData.isPremiumPersonal = false;
        } else if (planType === "professional") {
          updateData.isPremiumProfessional = false;
        }
        // Note: For business plans, we only update the businesses collection, not users

        await db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              ...updateData,
              updatedAt: new Date(),
            },
          }
        );

        // For business plan, remove role and update business record
        if (planType === "business") {
          // Remove business_owner role from user
          await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            {
              $pull: { role: "business_owner" },
              $set: { updatedAt: new Date() }
            }
          );

          let business = null;
          try {
            business = await db.collection("businesses").findOne({
              ownerId: new ObjectId(userId),
            });
          } catch (error) {
            console.error(
              "Error finding business for subscription cancellation:",
              error
            );
          }

          if (business) {
            await db.collection("businesses").updateOne(
              { _id: business._id },
              {
                $set: {
                  isPremiumBusiness: false,
                  updatedAt: new Date(),
                },
              }
            );
            console.log(
              "Business premium status canceled for business:",
              business._id
            );
          } else {
            console.log(
              "No business found for user during subscription cancellation:",
              userId
            );
          }
        }

        // Update subscription status
        await db.collection("subscriptions").updateOne(
          { stripeSubscriptionId: subscription.id },
          {
            $set: {
              status: "canceled",
              updatedAt: new Date(),
            },
          }
        );

        console.log(`User ${userId} subscription canceled`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
