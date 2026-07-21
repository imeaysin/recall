import type { RouteObject } from "react-router-dom"
import { routeSegments } from "@/config/routes"
import { ChatDetailPage, ChatListPage } from "./pages/chat-pages"

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
