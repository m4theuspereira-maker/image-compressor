import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongo: MongoMemoryServer;

export const memoryServerConfig = async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  return {
    uri: mongoUri,
  };
};

export const closeConnection = async () => {
  await mongoose.connection.close();
  await mongo.stop();
};
