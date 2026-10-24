export type RedisSentinelNode = {
  host: string;
  port: number;
};

export type RedisConfig = {
  url: string;
  host: string;
  port: number;
  username?: string | undefined;
  password?: string | undefined;
  db: number;
  tls: boolean;
  tlsRejectUnauthorized: boolean;
  keyPrefix: string;
  bullmqPrefix: string;
  sentinels?: RedisSentinelNode[] | undefined;
  sentinelName?: string | undefined;
};
