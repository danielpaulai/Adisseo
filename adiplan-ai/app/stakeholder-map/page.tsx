import StakeholderMap from "@/components/StakeholderMap";
import { WorkshopOverlay } from "@/components/WorkshopOverlay";
import { MaybeRoomProvider } from "@/components/MaybeRoomProvider";

export default function StakeholderMapPage() {
  return (
    <MaybeRoomProvider roomId="adiplan-stakeholder-map">
      <div className="relative">
        <StakeholderMap />
        <WorkshopOverlay />
      </div>
    </MaybeRoomProvider>
  );
}
