"use client";

import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import MobileLayout from "@/components/layout/MobileLayout";
import ChatThread from "@/components/chat/ChatThread";

export default function CustomerMessageThreadPage() {
  const params = useParams<{ id: string }>();

  return (
    <MobileLayout>
      <Box sx={{ px: 2, pt: 3 }}>
        <ChatThread conversationId={params.id} backHref="/messages" title="แชทกับร้านค้า" />
      </Box>
    </MobileLayout>
  );
}
