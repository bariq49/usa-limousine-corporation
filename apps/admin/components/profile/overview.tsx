"use client";

import { useOverview } from "@/hooks/queries/use-drivers";
import { ProfileProgress } from "./profile-progress";
import { AboutCard } from "./about-card";
import { ProfileCard } from "./profile-card";
import { WorkDetails } from "./work-details";
import { ServicesCard } from "./services-card";
import { LanguagesCard } from "./languages-card";
import { DeleteRequestCard } from "./delete-request-card";
import { TabsContent } from "@usa-limousine-corporation/ui/components/tabs";

export function Overview({ driverId }: { driverId: string }) {
  const { data: driver } = useOverview(driverId);

  return (
    <TabsContent value="overview">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-5 xl:col-span-4">
          <ProfileProgress driver={driver} />
          <ProfileCard driver={driver} />
          <ServicesCard driver={driver} />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
          <AboutCard driver={driver} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <WorkDetails driver={driver} />
            <LanguagesCard driver={driver} />
          </div>
          <DeleteRequestCard driver={driver} />
        </div>
      </div>
    </TabsContent>
  );
}
