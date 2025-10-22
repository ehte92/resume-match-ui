import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTemplates, getTemplateCategories } from '@/lib/api';
import type { CoverLetterTemplateResponse } from '@/types/api';
import { Search, Sparkles, User, Filter, X } from 'lucide-react';

interface TemplateBrowserProps {
  onSelectTemplate: (template: CoverLetterTemplateResponse) => void;
  selectedTemplateId?: string | null;
}

export default function TemplateBrowser({ onSelectTemplate, selectedTemplateId }: TemplateBrowserProps) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [templateType, setTemplateType] = useState<boolean | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['template-categories'],
    queryFn: getTemplateCategories,
  });

  // Fetch templates
  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['templates', page, searchQuery, selectedCategory, selectedTone, templateType],
    queryFn: () =>
      getTemplates(page, 20, {
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        tone: selectedTone,
        is_system: templateType,
        sortBy: 'usage_count',
        sortOrder: 'desc',
      }),
  });

  const templates = templatesData?.templates || [];
  const totalPages = templatesData ? Math.ceil(templatesData.total / 20) : 1;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, selectedTone, templateType]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTone(null);
    setTemplateType(null);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedTone !== null || templateType !== null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold">Browse Templates</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border-2 border-black font-bold hover:bg-gray-50 transition-colors shadow-md text-sm"
          >
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-black font-bold focus:outline-none focus:border-primary transition-colors shadow-md text-sm"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-3 sm:p-4 bg-background border-2 border-black shadow-md rounded">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none focus:border-primary transition-colors text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tone Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-2">Tone</label>
                <select
                  value={selectedTone || ''}
                  onChange={(e) => setSelectedTone(e.target.value || null)}
                  className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none focus:border-primary transition-colors text-sm"
                >
                  <option value="">All Tones</option>
                  <option value="professional">Professional</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>

              {/* Template Type Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-2">Template Type</label>
                <select
                  value={templateType === null ? '' : templateType.toString()}
                  onChange={(e) => setTemplateType(e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none focus:border-primary transition-colors text-sm"
                >
                  <option value="">All Templates</option>
                  <option value="true">System Templates</option>
                  <option value="false">My Templates</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 sm:mt-4 flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border-2 border-black font-bold hover:bg-gray-50 transition-colors shadow-md text-sm"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8 sm:py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-black border-t-transparent"></div>
          <p className="mt-3 sm:mt-4 font-bold text-sm sm:text-base">Loading templates...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && templates.length === 0 && (
        <div className="text-center py-8 sm:py-12 px-4 bg-gray-100 border-2 border-black rounded shadow-md">
          <p className="text-lg sm:text-xl font-bold mb-2">No templates found</p>
          <p className="text-gray-600 font-medium text-sm sm:text-base">
            {hasActiveFilters ? 'Try adjusting your filters' : 'No templates available yet'}
          </p>
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && templates.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={template.id === selectedTemplateId}
                onSelect={() => onSelectTemplate(template)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 sm:px-6 py-2 bg-white border-2 border-black font-bold hover:bg-gray-50 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Previous
              </button>
              <span className="font-bold text-sm sm:text-base">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 sm:px-6 py-2 bg-white border-2 border-black font-bold hover:bg-gray-50 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: CoverLetterTemplateResponse;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const getToneBadgeColor = (tone: string) => {
    switch (tone) {
      case 'professional':
        return 'bg-blue-200';
      case 'enthusiastic':
        return 'bg-pink-200';
      case 'balanced':
        return 'bg-green-200';
      default:
        return 'bg-gray-200';
    }
  };

  const getLengthBadgeColor = (length: string) => {
    switch (length) {
      case 'short':
        return 'bg-yellow-200';
      case 'medium':
        return 'bg-orange-200';
      case 'long':
        return 'bg-red-200';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div
      className={`p-3 sm:p-4 bg-white border-2 border-black cursor-pointer transition-all shadow-md hover:shadow-lg rounded ${
        isSelected
          ? 'bg-green-50 ring-2 ring-primary'
          : ''
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold mb-0.5 sm:mb-1 line-clamp-2">{template.name}</h3>
          <p className="text-xs sm:text-sm font-medium text-gray-600">{template.category}</p>
        </div>
        {template.is_system ? (
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 ml-2" />
        ) : (
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 ml-2" />
        )}
      </div>

      {/* Description */}
      {template.description && (
        <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 line-clamp-2">{template.description}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <span
          className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold border-2 border-black rounded ${getToneBadgeColor(
            template.tone
          )}`}
        >
          {template.tone}
        </span>
        <span
          className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold border-2 border-black rounded ${getLengthBadgeColor(
            template.length
          )}`}
        >
          {template.length}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 font-medium">
        <span>{template.is_system ? 'System Template' : 'My Template'}</span>
        <span>Used {template.usage_count}x</span>
      </div>

      {isSelected && (
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t-2 border-primary">
          <p className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
            Selected
          </p>
        </div>
      )}
    </div>
  );
}
