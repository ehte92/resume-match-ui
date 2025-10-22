import { useState, useEffect } from 'react';
import { X, Tag as TagIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { Badge } from '@/components/retroui/Badge';
import { getAvailableTags } from '@/lib/api';
import type { TagCategories } from '@/types/api';

export interface FilterState {
  search: string;
  tags: string[];
  tone: string | null;
  length: string | null;
  sortBy: string;
  sortOrder: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const FilterBar = ({ filters, onFiltersChange }: FilterBarProps) => {
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [availableTags, setAvailableTags] = useState<TagCategories | null>(null);

  useEffect(() => {
    getAvailableTags()
      .then(setAvailableTags)
      .catch((error) => console.error('Failed to load tags:', error));
  }, []);

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handleToneChange = (tone: string | null) => {
    onFiltersChange({ ...filters, tone });
  };

  const handleLengthChange = (length: string | null) => {
    onFiltersChange({ ...filters, length });
  };

  const handleSortChange = (sortBy: string, sortOrder?: string) => {
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder: sortOrder || filters.sortOrder,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      tags: [],
      tone: null,
      length: null,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
    setShowTagsDropdown(false);
  };

  const hasActiveFilters = filters.tags.length > 0 || filters.tone || filters.length;

  return (
    <div className="space-y-3 sm:space-y-4">
      {hasActiveFilters && (
        <div className="flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-2" />
            Clear
          </Button>
        </div>
      )}

        {/* Tags Filter */}
        {availableTags && (
          <div>
            <label className="text-xs sm:text-sm font-medium mb-2 block flex items-center gap-2">
              <TagIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Tags
            </label>
            <div>
              <Button
                variant="outline"
                onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                className="w-full justify-between"
              >
                <span className="text-sm">
                  {filters.tags.length > 0 ? `${filters.tags.length} selected` : 'Select tags...'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showTagsDropdown && (
                <div className="mt-2 border-2 border-black rounded p-3 max-h-64 overflow-y-auto bg-white space-y-3">
                  {Object.entries(availableTags).map(([category, tags]) => (
                    <div key={category}>
                      <p className="text-xs font-medium text-muted-foreground mb-2 capitalize">
                        {category.replace('_', ' ')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={filters.tags.includes(tag) ? 'solid' : 'outline'}
                            className={`cursor-pointer transition-all ${
                              filters.tags.includes(tag)
                                ? 'bg-primary text-white border-black'
                                : 'hover:bg-primary/10'
                            }`}
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="solid" className="bg-primary text-white border-black">
                      {tag}
                      <button
                        onClick={() => toggleTag(tag)}
                        className="ml-1 hover:bg-black/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tone and Length Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm font-medium mb-2 block">Tone</label>
            <div className="flex gap-2">
              {(['professional', 'enthusiastic', 'balanced'] as const).map((tone) => (
                <Badge
                  key={tone}
                  variant={filters.tone === tone ? 'solid' : 'outline'}
                  className={`cursor-pointer capitalize ${
                    filters.tone === tone
                      ? 'bg-primary text-white border-black'
                      : 'hover:bg-primary/10 border-black'
                  }`}
                  onClick={() => handleToneChange(filters.tone === tone ? null : tone)}
                >
                  {tone}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium mb-2 block">Length</label>
            <div className="flex gap-2">
              {(['short', 'medium', 'long'] as const).map((length) => (
                <Badge
                  key={length}
                  variant={filters.length === length ? 'solid' : 'outline'}
                  className={`cursor-pointer capitalize ${
                    filters.length === length
                      ? 'bg-primary text-white border-black'
                      : 'hover:bg-primary/10 border-black'
                  }`}
                  onClick={() => handleLengthChange(filters.length === length ? null : length)}
                >
                  {length}
                </Badge>
              ))}
            </div>
          </div>
        </div>

      {/* Sort Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="text-xs sm:text-sm font-medium mb-2 block">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full border-2 border-black rounded px-3 py-2 text-sm bg-white"
          >
            <option value="created_at">Date Created</option>
            <option value="word_count">Word Count</option>
            <option value="job_title">Job Title</option>
            <option value="company_name">Company Name</option>
          </select>
        </div>

        <div>
          <label className="text-xs sm:text-sm font-medium mb-2 block">Order</label>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleSortChange(filters.sortBy, e.target.value)}
            className="w-full border-2 border-black rounded px-3 py-2 text-sm bg-white"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
    </div>
  );
};
