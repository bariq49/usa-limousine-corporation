import { Card } from "@usa-limousine-corporation/ui/components/card";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

import { useOverview } from "@/hooks/queries/use-drivers";
import { DocumentsSkeleton } from "../skeletons/documents-skeleton";
import type { Document } from "@/lib/types/drivers";

export function Documents({ driverId }: { driverId: string }) {
  const { data: driver, isLoading } = useOverview(driverId);
  const documents = driver?.documents ?? [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30";
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="w-2.5 h-2.5 mr-1" />;
      case "REJECTED":
        return <XCircle className="w-2.5 h-2.5 mr-1" />;
      case "PENDING":
        return <Clock className="w-2.5 h-2.5 mr-1" />;
      default:
        return null;
    }
  };

  const formatDocType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (isLoading) {
    return <DocumentsSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {documents.map((doc: Document) => {
        const isPdf =
          doc.url?.toLowerCase().endsWith(".pdf") || doc.publicId?.toLowerCase().endsWith(".pdf");

        return (
          <Card
            key={doc.id}
            className="relative overflow-hidden transition-all hover:shadow-md group aspect-[4/3] sm:aspect-auto sm:min-h-[250px] border border-border shadow-xs"
          >
            {doc.url && (
              <Link
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-20"
                aria-label={`View ${formatDocType(doc.documentType)}`}
              />
            )}
            {isPdf ? (
              <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="mb-2 h-12 w-12 opacity-60" />
                <span className="text-sm font-medium z-10 relative">PDF Document</span>
              </div>
            ) : doc.url ? (
              <img
                src={doc.url}
                alt={formatDocType(doc.documentType)}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='50' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="mb-2 h-12 w-12 opacity-40" />
                <span className="text-sm font-medium z-10 relative">No Preview</span>
              </div>
            )}
            <div className="absolute top-0 right-0 z-30">
              <Badge
                variant="soft"
                className={`rounded-none rounded-bl-xl shadow-sm flex items-center px-2 py-1 border-t-0 border-r-0 font-semibold text-[10px] tracking-wide uppercase ${getStatusColor(doc.verificationStatus)}`}
              >
                {getStatusIcon(doc.verificationStatus)}
                {doc.verificationStatus}
              </Badge>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 z-0 pointer-events-none" />

            <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-6 z-10 flex flex-col pointer-events-none">
              <div>
                <h4
                  className="font-semibold text-base text-white line-clamp-1"
                  title={formatDocType(doc.documentType)}
                >
                  {formatDocType(doc.documentType)}
                </h4>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
