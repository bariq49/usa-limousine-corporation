"use client";

import { TabsContent } from "@usa-limousine-corporation/ui/components/tabs";
import { ActivityList } from "./activity-list";

type Props = {
  driverId: string;
};

export function Activity(props: Props) {
  const { driverId } = props;

  return (
    <TabsContent value="activity">
      <ActivityList driverId={driverId} />
    </TabsContent>
  );
}
