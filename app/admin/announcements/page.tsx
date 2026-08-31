import { listAnnouncementsForAdmin } from "@/services/announcement.service";
import { NewAnnouncementForm } from "./NewAnnouncementForm";
import { AnnouncementRow } from "./AnnouncementRow";

export default async function AdminAnnouncementsPage() {
  const announcements = await listAnnouncementsForAdmin();

  return (
    <div className="max-w-lg">
      <h1 className="mb-1 text-xl font-semibold">Home Page Banners</h1>
      <p className="mb-6 text-sm text-neutral-500">
        These images rotate in the carousel near the top of the customer home page. Toggle "Live" to show or hide
        one without deleting it.
      </p>

      <NewAnnouncementForm />

      <div className="mt-6 space-y-2">
        {announcements.length === 0 ? (
          <p className="text-neutral-500">No banners yet — publish one above.</p>
        ) : (
          announcements.map((a) => <AnnouncementRow key={a.id} announcement={a} />)
        )}
      </div>
    </div>
  );
}
