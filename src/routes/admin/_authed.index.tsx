import { createFileRoute } from '@tanstack/react-router'
import {
  listAllRestaurants,
  getPlatformAnalytics,
  getVisitStats,
} from '../../server/admin.functions'

export const Route = createFileRoute('/admin/_authed/')({
  loader: async () => {
    const [restaurants, analytics, visits] = await Promise.all([listAllRestaurants(), getPlatformAnalytics(), getVisitStats()])
    return { restaurants, analytics, visits }
  },
})
