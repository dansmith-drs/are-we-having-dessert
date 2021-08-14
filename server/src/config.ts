import dotenv from 'dotenv';

const path = __dirname + '/../.env';
dotenv.config({ path });
const env = {
  clientEndpoint: process.env.CLIENT_ENDPOINT,
};

export default env;
