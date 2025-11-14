import Event  from "@/database/event.model";
import {v2 as cloudinary} from "cloudinary";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

/**
 * Creates a new event from multipart/form-data, uploads the provided image to Cloudinary, and stores the event in the database.
 *
 * Expects multipart/form-data with standard event fields, `image` (File, required), and `tags` and `agenda` as JSON-encoded strings.
 *
 * @param req - Incoming NextRequest containing multipart/form-data with event fields and the image file
 * @returns On success, a JSON object with a success message and the created event; on client validation errors, a JSON object with an error message and a 400 status; on server errors, a JSON object with an error message and a 500 status
 */
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries())
        } catch (e) {
            return NextResponse.json({ message: 'Invalid JSON data format' }, {status: 400})
        }

        const file = formData.get('image') as File;

        if (!file) return NextResponse.json({message: 'Image file is required'}, {status: 400})

        const tags = JSON.parse(formData.get('tags') as string);
        const agenda = JSON.parse(formData.get('agenda') as string);

        const arraBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arraBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({resource_type: 'image', folder: 'EventHub'}, (error, results) => {
                if (error) return reject(error);

                resolve(results)
            }).end(buffer)
        })  

        event.image = (uploadResult as {secure_url: string}).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        return NextResponse.json({message: 'Event Created Successfully', event: createdEvent}, {status: 201})

    } catch (e) {
        console.error(e)
        return NextResponse.json({ message: 'Event Creation Failed', e: e instanceof Error ? e.message : 'Unknown'}, {status: 500})
    }
}

/**
 * Handle GET requests to retrieve all events sorted by creation date (newest first).
 *
 * @returns A JSON response with `message` and `events` (array of Event documents) on success; on failure, a JSON response with `message` and `error`.
 */
export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({createdAt: -1});

        return NextResponse.json({message: 'Event fetched successfully.', events}, {status: 200})
    } catch (e) {
        return NextResponse.json({message: 'Event fetching failed.', error: e}, {status: 500})
    }
}