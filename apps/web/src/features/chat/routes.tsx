import type { RouteObject } from "react-router-dom"
import { routeSegments } from "@/config/routes"
import { ChatDetailPage } from "@/features/chat/pages/chat-detail-page"
import { ChatListPage } from "@/features/chat/pages/chat-list-page"

export const chatRoutes: RouteObject[] = [
  {
    path: routeSegments.app.chat,
    children: [
      {
        index: true,
        element: <ChatListPage />,
      },
      {
        path: ":chatId",
        element: <ChatDetailPage />,
      },
    ],
  },
]
