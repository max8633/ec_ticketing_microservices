import { Message } from "node-nats-streaming";
import { Listener, Subjects, TicketCreatedEvent } from "@mkvalidate/common";
import { Ticket } from "../../models/tickets";
import { queueGroupName } from "./queue-group-name";

// issue: the ticketId in orders_srv is not equal to in tickets_srv
// ans: 

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;
    const ticket = Ticket.build({
      id,
      title,
      price
    });
    await ticket.save();

    msg.ack();
  }
}