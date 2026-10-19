"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/profile/header";
import { Tabs, TabsContent } from "@usa-limousine-corporation/ui/components/tabs";
import { Activity } from "@/components/profile/activity";
import { Documents } from "@/components/profile/documents";
import { Overview } from "@/components/profile/overview";
import { Performance } from "@/components/profile/performance";
import { Reviews } from "@/components/profile/reviews";
import { VehicleDetails } from "@/components/profile/vehicle-details";

export default function DriverProfilePage() {
  const params = useParams<{ id: string }>();

  return (
    <Tabs defaultValue="overview" className="flex flex-col gap-6">
      <Header driverId={params.id} />
      <div>
        <Overview driverId={params.id} />
        <TabsContent value="documents">
          <Documents driverId={params.id} />
        </TabsContent>
        <TabsContent value="vehicle">
          <VehicleDetails driverId={params.id} />
        </TabsContent>
        <TabsContent value="reviews">
          <Reviews driver={{ id: params.id }} />
        </TabsContent>
        <Activity driverId={params.id} />
        <Performance driverId={params.id} />
      </div>
    </Tabs>
  );
}
