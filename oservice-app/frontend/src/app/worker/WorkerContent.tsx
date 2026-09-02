'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import Header from '@/components/shared/Header';
import JobCard from '@/components/shared/JobCard';
import { JobCardSkeleton } from '@/components/shared/Skeleton';
import { MOCK_JOBS } from '@/data/mockData';
import { JobPost } from '@/types';
import { useRouter } from 'next/navigation';

export default function WorkerContent() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [filterWilaya, setFilterWilaya] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setJobs(MOCK_JOBS.filter((j) => j.status === 'active'));
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.companyName.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());
    const matchesWilaya = !filterWilaya || job.wilaya === filterWilaya;
    return matchesSearch && matchesWilaya;
  });

  return (
    <div className="page-container">
      <Header title={t(lang, 'jobFeed')} showLogout />

      <main className="max-w-lg mx-auto px-4 pb-4">
        {/* Search Bar */}
        <div
          className="sticky top-14 z-30 backdrop-blur-xl py-3 -mx-4 px-4"
          style={{ backgroundColor: 'var(--bg)' }}
        >
          <div className="relative">
            <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(lang, 'searchPlaceholder')}
              className="input-field ps-10 pe-10"
            />
            <button className="absolute end-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-surface-hover">
              <SlidersHorizontal size={16} className="text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2 mb-4">
          <span className="badge-mint">
            {filteredJobs.length} {lang === 'ar' ? 'وظيفة' : 'offres'}
          </span>
          {filterWilaya && (
            <button
              onClick={() => setFilterWilaya('')}
              className="badge-steel cursor-pointer hover:bg-surface-hover"
            >
              <MapPin size={10} className="me-1" />
              {filterWilaya}
              <span className="ms-1">&times;</span>
            </button>
          )}
        </div>

        {/* Job List */}
        {loading ? (
          <JobCardSkeleton count={4} />
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <Search size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-text-secondary text-sm">{t(lang, 'noResults')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                lang={lang}
                onClick={() => router.push(`/worker/job/${job.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
