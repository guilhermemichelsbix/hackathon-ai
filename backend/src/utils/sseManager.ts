import { Response } from 'express';
import { KanbanEvent, KanbanEventType } from '@/types';
import { logger } from './logger';

interface SSEClient {
  id: string;
  response: Response;
  lastEventId?: string;
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();
  private eventId = 0;

  addClient(clientId: string, res: Response, lastEventId?: string): void {
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Send initial connection event
    this.sendEvent(res, 'connection', { clientId }, clientId);

    // Store client
    this.clients.set(clientId, {
      id: clientId,
      response: res,
      lastEventId,
    });

    // Handle client disconnect
    res.on('close', () => {
      this.removeClient(clientId);
    });

    logger.info(`SSE client connected: ${clientId}`);
  }

  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      try {
        client.response.end();
      } catch (error) {
        logger.error(`Error closing SSE connection for client ${clientId}:`, error);
      }
      this.clients.delete(clientId);
      logger.info(`SSE client disconnected: ${clientId}`);
    }
  }

  broadcastEvent(event: KanbanEvent): void {
    const eventData = this.formatEvent(event);
    
    this.clients.forEach((client, clientId) => {
      try {
        this.sendEvent(client.response, event.type, event.payload, clientId, event.timestamp);
      } catch (error) {
        logger.error(`Error sending event to client ${clientId}:`, error);
        this.removeClient(clientId);
      }
    });

    logger.debug(`Event broadcasted to ${this.clients.size} clients:`, event);
  }

  sendEvent(
    res: Response, 
    eventType: KanbanEventType | 'connection', 
    data: any, 
    clientId: string,
    timestamp?: Date
  ): void {
    try {
      const eventId = (++this.eventId).toString();
      const eventTimestamp = timestamp || new Date();

      const eventData = {
        type: eventType,
        payload: data,
        timestamp: eventTimestamp,
        eventId,
      };

      res.write(`id: ${eventId}\n`);
      res.write(`event: ${eventType}\n`);
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);

      logger.debug(`Event sent to client ${clientId}:`, eventData);
    } catch (error) {
      logger.error(`Error sending event to client ${clientId}:`, error);
      this.removeClient(clientId);
    }
  }

  private formatEvent(event: KanbanEvent): string {
    return JSON.stringify({
      type: event.type,
      payload: event.payload,
      timestamp: event.timestamp,
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getClients(): string[] {
    return Array.from(this.clients.keys());
  }

  // Specific event broadcasters
  broadcastCardCreated(card: any): void {
    this.broadcastEvent({
      type: 'card.created',
      payload: card,
      timestamp: new Date(),
    });
  }

  broadcastCardUpdated(card: any): void {
    this.broadcastEvent({
      type: 'card.updated',
      payload: card,
      timestamp: new Date(),
    });
  }

  broadcastCardMoved(data: { cardId: string; fromColumnId: string; toColumnId: string; position: number }): void {
    this.broadcastEvent({
      type: 'card.moved',
      payload: data,
      timestamp: new Date(),
    });
  }

  broadcastCardDeleted(cardId: string): void {
    this.broadcastEvent({
      type: 'card.deleted',
      payload: { cardId },
      timestamp: new Date(),
    });
  }

  broadcastVoteAdded(vote: any): void {
    this.broadcastEvent({
      type: 'vote.added',
      payload: vote,
      timestamp: new Date(),
    });
  }

  broadcastVoteRemoved(data: { cardId: string; userId: string }): void {
    this.broadcastEvent({
      type: 'vote.removed',
      payload: data,
      timestamp: new Date(),
    });
  }

  broadcastCommentAdded(comment: any): void {
    this.broadcastEvent({
      type: 'comment.added',
      payload: comment,
      timestamp: new Date(),
    });
  }

  broadcastCommentUpdated(comment: any): void {
    this.broadcastEvent({
      type: 'comment.updated',
      payload: comment,
      timestamp: new Date(),
    });
  }

  broadcastCommentDeleted(data: { commentId: string; cardId: string }): void {
    this.broadcastEvent({
      type: 'comment.deleted',
      payload: data,
      timestamp: new Date(),
    });
  }

  broadcastPollCreated(poll: any): void {
    this.broadcastEvent({
      type: 'poll.created',
      payload: poll,
      timestamp: new Date(),
    });
  }

  broadcastPollUpdated(poll: any): void {
    this.broadcastEvent({
      type: 'poll.updated',
      payload: poll,
      timestamp: new Date(),
    });
  }

  broadcastPollDeleted(data: { pollId: string; cardId: string }): void {
    this.broadcastEvent({
      type: 'poll.deleted',
      payload: data,
      timestamp: new Date(),
    });
  }

  broadcastPollVoted(data: { pollId: string; optionId: string; userId: string }): void {
    this.broadcastEvent({
      type: 'poll.voted',
      payload: data,
      timestamp: new Date(),
    });
  }

  broadcastPollVoteRemoved(data: { pollId: string; optionId: string; userId: string }): void {
    this.broadcastEvent({
      type: 'poll.vote.removed',
      payload: data,
      timestamp: new Date(),
    });
  }
}

// Singleton instance
export const sseManager = new SSEManager();
