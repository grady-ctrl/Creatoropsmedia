'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CreatorFiltersProps {
  managers: Array<{ id: string; displayName: string }>;
}

export function CreatorFilters({ managers }: CreatorFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/dashboard/creators');
  };

  const hasFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border">
      <Input
        placeholder="Search creators..."
        className="max-w-xs"
        defaultValue={searchParams.get('search') || ''}
        onChange={(e) => updateFilter('search', e.target.value)}
      />

      <Select
        value={searchParams.get('stage') || ''}
        onValueChange={(value) => updateFilter('stage', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Stages</SelectItem>
          <SelectItem value="LEAD">Lead</SelectItem>
          <SelectItem value="APPLIED">Applied</SelectItem>
          <SelectItem value="ONBOARDING">Onboarding</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="PAUSED">Paused</SelectItem>
          <SelectItem value="OFFBOARDED">Offboarded</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('manager') || ''}
        onValueChange={(value) => updateFilter('manager', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Manager" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Managers</SelectItem>
          {managers.map((manager) => (
            <SelectItem key={manager.id} value={manager.id}>
              {manager.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('risk') || ''}
        onValueChange={(value) => updateFilter('risk', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Risk Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Levels</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="CRITICAL">Critical</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
