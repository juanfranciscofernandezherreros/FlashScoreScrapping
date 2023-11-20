const Kafka = require('node-rdkafka');

const consumer = new Kafka.KafkaConsumer({
  'metadata.broker.list': 'localhost:9092', // e.g., 'localhost:9092'
});

consumer.connect();

consumer
  .on('ready', () => {
    console.log('Consumer is ready');

    // Subscribe to the Kafka topic
    consumer.subscribe(['COMPETICIONES']);

    // Consume messages
    consumer.consume();
  })
  .on('data', (message) => {
    // Handle incoming message
    console.log(`Received message: ${message.value.toString()}`);
  })
  .on('event.error', (err) => {
    console.error(`Error: ${err}`);
    process.exit(1);
  });

// Handle process termination
process.on('SIGINT', () => {
  consumer.disconnect();
});
