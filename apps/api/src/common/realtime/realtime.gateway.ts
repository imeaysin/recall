import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { createLogger } from "@workspace/logger"
import { UsePipes } from "@nestjs/common"
import { ZodValidationPipe } from "nestjs-zod"
import { z } from "zod"
import { createZodDto } from "nestjs-zod/dto"

// Example of a type-safe incoming payload using our Zod pipeline conventions
const PingPayloadSchema = z.object({
  message: z.string().min(1),
  timestamp: z.string().datetime(),
})

class PingPayloadDto extends createZodDto(PingPayloadSchema) {}

@WebSocketGateway({
  cors: {
    origin: "*", // Or map to allowedOrigins from config
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server

  private readonly logger = createLogger("RealtimeGateway")

  handleConnection(client: Socket) {
    // Note: To make this fully authenticated in the future, we can parse cookies
    // or headers using @workspace/auth helpers directly here.
    const token =
      client.handshake.auth.token || client.handshake.headers.authorization

    this.logger.info(
      { clientId: client.id, hasToken: !!token },
      "Client connected to websocket"
    )
  }

  handleDisconnect(client: Socket) {
    this.logger.info(
      { clientId: client.id },
      "Client disconnected from websocket"
    )
  }

  @UsePipes(new ZodValidationPipe())
  @SubscribeMessage("ping")
  handlePing(
    @MessageBody() data: PingPayloadDto,
    @ConnectedSocket() client: Socket
  ): { event: string; data: { response: string } } {
    this.logger.debug(
      { clientId: client.id, payload: data },
      "Received ping event"
    )

    // Using strictly typed responses
    return {
      event: "pong",
      data: {
        response: `Received: ${data.message} at ${new Date().toISOString()}`,
      },
    }
  }

  // Example of broadcasting to all clients with type-safety
  broadcastEvent<T>(event: string, payload: T) {
    this.server.emit(event, payload)
  }
}
