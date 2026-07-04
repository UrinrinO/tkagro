import { redirect } from 'next/navigation';
export default function CatalogSlugRedirect({ params }: { params: { slug: string } }) {
  redirect(`/shop/${params.slug}`);
}
