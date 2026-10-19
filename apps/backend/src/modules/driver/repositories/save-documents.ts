import type { Prisma } from "@prisma/client";
import type { SaveDriverDocumentsData } from "../types/documents";

export async function saveDocumentsInTx(
  tx: Prisma.TransactionClient,
  driverId: string,
  documents: SaveDriverDocumentsData["documents"],
  documentTypes: SaveDriverDocumentsData["documents"][number]["documentType"][],
  now: Date,
) {
  if (documents.length === 0) {
    return;
  }

  await tx.driverDocument.updateMany({
    where: {
      driverId,
      documentType: { in: documentTypes },
      deletedAt: null,
    },
    data: { deletedAt: now },
  });

  await tx.driverDocument.createMany({
    data: documents.map((document) => ({
      driverId,
      documentType: document.documentType,
      url: document.url,
      publicId: document.url,
    })),
  });
}
