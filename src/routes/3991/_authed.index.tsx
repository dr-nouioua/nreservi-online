import { createFileRoute } from '@tanstack/react-router'
import {
  listAllRestaurants,
  getPlatformAnalytics,
  getVisitStats,
} from '../../server/admin.functions'

export const Route = createFileRoute('/3991/_authed/')({
  loader: async () => {
    const [restaurants, analytics, visits] = await Promise.all([listAllRestaurants(), getPlatformAnalytics(), getVisitStats()])
    return { restaurants, analytics, visits }
  },
})
