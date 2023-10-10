import { BigQuery } from '@google-cloud/bigquery';
import { ENV } from '../constants';

const bigQueryClient = new BigQuery({
  autoRetry: true,
  maxRetries: 10,
  location: ENV.REGION,
});

export default bigQueryClient;
