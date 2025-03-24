import { createConsumer } from "@rails/actioncable"

const token = localStorage.getItem('token')

const consumer = createConsumer(`ws://localhost:4000/cable?token=${token}`);

export default consumer;