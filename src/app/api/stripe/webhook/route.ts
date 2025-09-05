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

        // Update user's premium status based on plan type
        const updateData: any = {};
        if (planType === "client") {
          updateData.isPremiumPersonal = true;
        } else if (planType === "professional") {
          updateData.isPremiumProfessional = true;
        }

        const updateResult = await db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              ...updateData,
              updatedAt: new Date(),
            },
          }
        );

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

        await db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              ...updateData,
              updatedAt: new Date(),
            },
          }
        );

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

        await db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              ...updateData,
              updatedAt: new Date(),
            },
          }
        );

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
