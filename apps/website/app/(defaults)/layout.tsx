import DefaultLayout from '@/layout/layout';

export default async function Layout({ children }: { children: React.ReactNode; }) {
    return <DefaultLayout>{children}</DefaultLayout>;
}
