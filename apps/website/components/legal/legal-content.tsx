import Link from "next/link";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { Stagger, StaggerItem } from "@/components/animations";
import TableOfContents from "@/components/legal/table-of-contents";
import type { LegalContentProps } from "@/types/legal.types";

export default function LegalContent(props: LegalContentProps) {
  const { document } = props;

  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <aside className="shrink-0 lg:w-1/4">
            <TableOfContents
              items={document.sections.map((section) => ({
                id: section.id,
                label: section.title,
              }))}
            />
          </aside>

          <Stagger
            viewport={{ once: true, amount: 0 }}
            className="min-w-0 space-y-10 pb-28 text-sm leading-relaxed text-neutral-600 sm:text-base lg:w-3/4 lg:space-y-12 lg:pb-0"
          >
            <StaggerItem className="border-b border-neutral-200 pb-8">
              <p className="text-base text-neutral-700 sm:text-lg">{document.intro}</p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium text-neutral-900">
                <span>Effective Date: {document.effectiveDate}</span>
                <span>Last Updated: {document.lastUpdated}</span>
              </div>
            </StaggerItem>

            {document.sections.map((section) => (
              <StaggerItem key={section.id} id={section.id} className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                  {section.title}
                </h2>
                {section.blocks.map((block, index) => {
                  if (block.type === "paragraph") {
                    return <p key={index}>{block.text}</p>;
                  }
                  if (block.type === "list") {
                    return (
                      <ul key={index} className="list-disc space-y-1.5 pl-6 marker:text-secondary">
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (block.type === "terms") {
                    return (
                      <ul key={index} className="space-y-3">
                        {block.items.map((item) => (
                          <li
                            key={item.term}
                            className="rounded-md border border-neutral-200 bg-cream-50 px-4 py-3"
                          >
                            <strong className="font-semibold text-neutral-900">{item.term}</strong>
                            <span className="text-neutral-400"> — </span>
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <address
                      key={index}
                      className="space-y-1 rounded-md border border-neutral-200 bg-cream-50 px-4 py-4 not-italic"
                    >
                      <p className="font-semibold text-neutral-900">{PLATFORM.name}</p>
                      <p>
                        Website:{" "}
                        <Link href="/" className="font-medium text-secondary hover:underline">
                          usalimocorp.com
                        </Link>
                      </p>
                      <p>
                        Email:{" "}
                        <a
                          href={PLATFORM.contact.emailHref}
                          className="font-medium text-secondary hover:underline"
                        >
                          {PLATFORM.contact.email}
                        </a>
                      </p>
                    </address>
                  );
                })}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
