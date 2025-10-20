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
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Browse Templates</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border-4 border-black font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-4 border-black font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-6 bg-yellow-100 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-black mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border-4 border-black font-bold focus:outline-none"
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
                <label className="block text-sm font-black mb-2">Tone</label>
                <select
                  value={selectedTone || ''}
                  onChange={(e) => setSelectedTone(e.target.value || null)}
                  className="w-full px-4 py-2 border-4 border-black font-bold focus:outline-none"
                >
                  <option value="">All Tones</option>
                  <option value="professional">Professional</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>

              {/* Template Type Filter */}
              <div>
                <label className="block text-sm font-black mb-2">Template Type</label>
                <select
                  value={templateType === null ? '' : templateType.toString()}
                  onChange={(e) => setTemplateType(e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full px-4 py-2 border-4 border-black font-bold focus:outline-none"
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
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border-4 border-black font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          <p className="mt-4 font-bold">Loading templates...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && templates.length === 0 && (
        <div className="text-center py-12 px-4 bg-gray-100 border-4 border-black">
          <p className="text-xl font-black mb-2">No templates found</p>
          <p className="text-gray-600 font-bold">
            {hasActiveFilters ? 'Try adjusting your filters' : 'No templates available yet'}
          </p>
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && templates.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="flex items-center justify-center gap-4 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-2 bg-white border-4 border-black font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="font-bold">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-6 py-2 bg-white border-4 border-black font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
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
      className={`p-6 bg-white border-4 border-black cursor-pointer transition-all ${
        isSelected
          ? 'bg-green-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] translate-x-1 translate-y-1'
          : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-black mb-1">{template.name}</h3>
          <p className="text-sm font-bold text-gray-600">{template.category}</p>
        </div>
        {template.is_system ? (
          <Sparkles className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        ) : (
          <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
        )}
      </div>

      {/* Description */}
      {template.description && (
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{template.description}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`px-3 py-1 text-xs font-black border-2 border-black ${getToneBadgeColor(
            template.tone
          )}`}
        >
          {template.tone}
        </span>
        <span
          className={`px-3 py-1 text-xs font-black border-2 border-black ${getLengthBadgeColor(
            template.length
          )}`}
        >
          {template.length}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
        <span>{template.is_system ? 'System Template' : 'My Template'}</span>
        <span>Used {template.usage_count} times</span>
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t-2 border-black">
          <p className="text-sm font-black text-green-700">✓ Selected</p>
        </div>
      )}
    </div>
  );
}
