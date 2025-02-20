import request from 'supertest';
import { app } from '../../app';
import { OrderStatus } from '@mkvalidate/common';
import { Order } from '../../models/order';
import { Ticket } from '../../models/tickets';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('marks an order as cancelled', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 10
  });
  await ticket.save();

  const user = global.signin();
  // Make a request to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  // Make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send({})
    .expect(204);


  // Expectation to make sure the order is cancelled
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('emits an order cancelled event', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 10
  });
  await ticket.save();

  const user = global.signin();
  // Make a request to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  // Make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send({})
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});