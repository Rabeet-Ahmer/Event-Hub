import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database/event.model";
import { getSimilarEventBySlug } from "@/lib/actions/event.actions";
import { cacheLife } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>
        {tag}
      </div>
    ))}
  </div>
);


const EventDetails = async ({params}: {params: Promise<string>}) => {
    "use cache";
    cacheLife("hours");
    const slug  = await params;

    const request = await fetch(`${BASE_URL}/api/events/${slug}`);
    const {event: {description, image, overview, date, time, audience, mode, location, agenda, tags, organizer, _id}} = await request.json()

    if (!description) return notFound()

const Bookings = 19;

// @ts-ignore
const similarEvents: IEvent[] = await getSimilarEventBySlug(slug);

  return (
    <section id= 'event'>
        <div className="header">
            <h1>Event Description</h1>
            <p className="mt-2">{description}</p>
        </div>

        <div className="details">
            {/* Leftside - Event Content */}
            <div className="content">
                <Image src={image} alt="Event Banner" width={400} height={400} className="banner"/>

                <section className="flex-col-gap-2">
                    <h2>Overview</h2>
                    <p>{overview}</p>
                </section>

                <section className="flex-col-gap-2">
                    <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date}/>
                    <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time}/>
                    <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location}/>
                    <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode}/>
                    <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience}/>
                </section>

                <EventAgenda agendaItems={agenda}/>

                <section className="flex-col-gap-2">
                    <h2>About The Organizer</h2>
                    <p>{organizer}</p>
                </section>

                <EventTags tags={tags}/>
            </div>

            {/* Rightside - Booking Form */}
            <aside className="booking">
                <div className="signup-card">
                    <h2>Book Your Spot</h2>
                    {Bookings > 0 ? (
                        <p className="text-sm">Join {Bookings} people who have already booked their spot!</p>
                    ): (
                        <p className="text-sm">Be the first to book your spot!</p>
                    )}

                    <BookEvent eventId ={_id} slug= {slug}/>
                </div>
            </aside>
        </div>

        <div className="flex w-full flex-col gap-4 pt-20">
            <h2>Similar Events</h2>
            <div className="events">
                {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) => (
                    <EventCard key={similarEvent.title} {...similarEvent}/>
                ))}
            </div>
        </div>
    </section>
  )
}

export default EventDetails