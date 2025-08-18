import httpClient from '@/lib/http/client';
import STATS_RPC from '@/lib/rpc/stats';

/**
 * 获取统计概览
 */
export function getStatsOverview() {
  return httpClient.get(STATS_RPC.overview);
}
