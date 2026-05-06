import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Service } from "@/components/FleepBubble";
import ProfileClient from "./ProfileClient";

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const user = await prisma.user.findUnique({
    where: { handle },
    select: { name: true, handle: true },
  });
  if (!user) return { title: "Not found" };
  return {
    title: `Pay ${user.name ?? user.handle} · Fleeper`,
    description: `Send a payment to @${user.handle} via Fleeper`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { handle } = await params;

  const user = await prisma.user.findUnique({
    where: { handle },
    select: {
      id: true,
      name: true,
      handle: true,
      isVerified: true,
      stripeAccountId: true,
      paymentLinks: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          amount: true,
          isFlexible: true,
        },
      },
    },
  });

  if (!user) notFound();

  const services: Service[] = user.paymentLinks.map((link) => ({
    id: link.id,
    title: link.title,
    description: link.description,
    amount: link.amount,
    isFlexible: link.isFlexible,
  }));

  const seller = {
    handle: user.handle,
    name: user.name ?? user.handle,
    isVerified: user.isVerified,
    stripeConnectedAccountId: user.stripeAccountId ?? undefined,
  };

  return <ProfileClient seller={seller} services={services} />;
}
