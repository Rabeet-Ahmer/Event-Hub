import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

/**
 * Handle GET requests to fetch an event by its route slug.
 *
 * Validates and normalizes the `slug` route parameter, attempts to load the matching event from the database, and returns a JSON NextResponse describing the result.
 *
 * @param params - Route parameters containing a `slug` string
 * @returns A NextResponse with JSON:
 *  - 200: `{ message: "Event fetched successfully", event }`
 *  - 404: `{ message: "Event with slug: <slug> not found" }`
 *  - 400: `{ message: "Invalid or missing slug parameter" }`
 *  - 500: `{ message: "Database configuration error" }` or `{ message: "Failed to fetch event", error: "<error message>" }` or `{ message: "An unexpected error occurred" }`
 */
export async function GET(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {

  try {
    await connectDB();
    const { slug } = await params;

    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { message: "Invalid or missing slug parameter" },
        { status: 400 }
      );
    }

    const sanitizedSlug = slug.trim().toLowerCase();

    const event = await Event.findOne({ slug: sanitizedSlug }).lean();

    if (!event) {
      return NextResponse.json(
        { message: `Event with slug: ${sanitizedSlug} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: `Event fetched successfully`, event },
      { status: 200 }
    );

  } catch (error) {

    if (process.env.NODE_ENV === "development")
      console.error("Error fetching event by slug:", error);

    if (error instanceof Error) {
        
      if (error.message.includes("MONGODB_URI")) {
        return NextResponse.json(
          { message: "Database configuration error" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "Failed to fetch event", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}