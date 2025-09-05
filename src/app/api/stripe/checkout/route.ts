import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planType } = await request.json();
    console.log("Requested plan type:", planType);

    if (
      !planType ||
      !["client", "professional", "business"].includes(planType)
    ) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    // Get user from database to check current subscription status
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User premium status:", {
      isPremiumPersonal: user.isPremiumPersonal,
      isPremiumProfessional: user.isPremiumProfessional,
      isPremiumBusiness: user.isPremiumBusiness,
    });

    // Check if user already has an active subscription for this plan type
    if (planType === "client" && user.isPremiumPersonal) {
      return NextResponse.json(
        {
          error:
            "Masz już aktywną subskrypcję Personal Pro. Nie możesz kupić drugi raz.",
        },
        { status: 400 }
      );
    }

    if (planType === "professional" && user.isPremiumProfessional) {
      return NextResponse.json(
        {
          error:
            "Masz już aktywną subskrypcję Professional Pro. Nie możesz kupić drugi raz.",
        },
        { status: 400 }
      );
    }

    // For business plans, check if user already has premium business
    if (planType === "business") {
      try {
        const business = await db.collection("businesses").findOne({
          ownerId: new ObjectId(session.user.id),
        });

        if (business && business.isPremiumBusiness) {
          return NextResponse.json(
            {
              error:
                "Masz już aktywną subskrypcję Business Pro. Nie możesz kupić drugi raz.",
            },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("Error checking business status:", error);
        // Continue with checkout if there's an error checking business status
      }
    }

    // Get the appropriate price ID based on plan type
    let priceId: string;
    switch (planType) {
      case "client":
        priceId = STRIPE_PRICES.CLIENT_PRO;
        break;
      case "professional":
        priceId = STRIPE_PRICES.PROFESSIONAL_PRO;
        break;
      case "business":
        priceId = STRIPE_PRICES.BUSINESS_PRO;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid plan type" },
          { status: 400 }
        );
    }

    // Get base URL
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://yourdomain.com"
        : "http://localhost:3000");

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?success=true&plan=${planType}`,
      cancel_url: `${baseUrl}/?canceled=true`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        planType: planType,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planType: planType,
        },
      },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
