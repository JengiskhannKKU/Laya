"use client";

import { useParams } from "next/navigation";
import ChatThread from "@/components/chat/ChatThread";

export default function MerchantMessageThreadPage() {
  const params = useParams<{ id: string }>();

  return <ChatThread conversationId={params.id} backHref="/merchant/messages" title="แชทกับลูกค้า" />;
}
