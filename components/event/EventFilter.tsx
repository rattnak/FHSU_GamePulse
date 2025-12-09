import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

type CategoryType = 'all' | 'game' | 'community';
type DateFilterType = 'allTime' | 'today' | 'thisWeek' | 'thisMonth';
type SortType = 'earliest' | 'latest';
type LocationType = 'all' | 'lewis' | 'gross' | 'soccer';

interface DropdownOption {
  label: string;
  value: string;
}

interface EventFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  category: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  dateFilter: DateFilterType;
  onDateFilterChange: (filter: DateFilterType) => void;
  sortOrder: SortType;
  onSortOrderChange: (order: SortType) => void;
  location?: LocationType;
  onLocationChange?: (location: LocationType) => void;
}

export default function EventFilter({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  dateFilter,
  onDateFilterChange,
  sortOrder,
  onSortOrderChange,
  location = 'all',
  onLocationChange,
}: EventFilterProps) {
  const [openDropdown, setOpenDropdown] = useState<'category' | 'date' | 'location' | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const categoryOptions: DropdownOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Games', value: 'game' },
    { label: 'Community', value: 'community' },
  ];

  const dateOptions: DropdownOption[] = [
    { label: 'All Time', value: 'allTime' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'thisWeek' },
    { label: 'This Month', value: 'thisMonth' },
  ];

  const locationOptions: DropdownOption[] = [
    { label: 'All Locations', value: 'all' },
    { label: 'Lewis Field Stadium', value: 'lewis' },
    { label: 'Gross Memorial Coliseum', value: 'gross' },
    { label: 'Soccer Stadium', value: 'soccer' },
  ];

  const getLabel = (type: 'category' | 'date' | 'location') => {
    if (type === 'category') {
      return categoryOptions.find(opt => opt.value === category)?.label || 'All';
    } else if (type === 'date') {
      return dateOptions.find(opt => opt.value === dateFilter)?.label || 'All Time';
    } else {
      return locationOptions.find(opt => opt.value === location)?.label || 'All Locations';
    }
  };

  const renderDropdown = (
    type: 'category' | 'date' | 'location',
    options: DropdownOption[],
    currentValue: string,
    onSelect: (value: any) => void
  ) => {
    const isOpen = openDropdown === type;

    // Determine if filter is applied (non-default value)
    const isFiltered = type === 'category' ? category !== 'all'
      : type === 'date' ? dateFilter !== 'allTime'
      : location !== 'all';

    // Reset filter to default
    const handleReset = (e: any) => {
      e.stopPropagation();
      if (type === 'category') onCategoryChange('all');
      else if (type === 'date') onDateFilterChange('allTime');
      else if (onLocationChange) onLocationChange('all');
    };

    return (
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={[styles.dropdownButton, isOpen && styles.dropdownButtonOpen]}
          onPress={() => setOpenDropdown(isOpen ? null : type)}
        >
          <Text style={styles.dropdownButtonText} numberOfLines={1} ellipsizeMode="tail">
            {getLabel(type)}
          </Text>
          {isFiltered ? (
            <TouchableOpacity onPress={handleReset}>
              <Ionicons
                name="close-circle"
                size={16}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          ) : (
            <Ionicons
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.textSecondary}
            />
          )}
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.dropdownMenu}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownOption,
                  option.value === currentValue && styles.dropdownOptionActive,
                ]}
                onPress={() => {
                  onSelect(option.value);
                  setOpenDropdown(null);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    option.value === currentValue && styles.dropdownOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {option.value === currentValue && (
                  <Ionicons name="checkmark" size={16} color={Colors.fhsuGold} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {/* Search Bar */}
      <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Dropdowns Row */}
      <View style={styles.filtersRow}>
        <View style={styles.categoryWrapper}>
          {renderDropdown('category', categoryOptions, category, onCategoryChange)}
        </View>
        <View style={styles.locationWrapper}>
          {renderDropdown('location', locationOptions, location, onLocationChange || (() => {}))}
        </View>
        <View style={styles.dateWrapper}>
          {renderDropdown('date', dateOptions, dateFilter, onDateFilterChange)}
        </View>

        {/* Sort Icon Button */}
        <TouchableOpacity
          style={[
            styles.sortIconButton,
            sortOrder === 'latest' && styles.sortIconButtonActive
          ]}
          onPress={() => onSortOrderChange(sortOrder === 'earliest' ? 'latest' : 'earliest')}
        >
          <Ionicons
            name={sortOrder === 'earliest' ? 'arrow-up' : 'arrow-down'}
            size={14}
            color={sortOrder === 'latest' ? Colors.fhsuGold : Colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchContainerFocused: {
    borderColor: Colors.fhsuGold,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    paddingVertical: Spacing.xs,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
    gap: Spacing.sm,
    alignItems: 'flex-start',
    zIndex: 1000,
  },
  categoryWrapper: {
    flex: 1.1,
    zIndex: 1003,
  },
  locationWrapper: {
    flex: 1.2,
    zIndex: 1002,
  },
  dateWrapper: {
    flex: 0.9,
    zIndex: 1001,
  },
  dropdownWrapper: {
    flex: 1,
    minWidth: 0,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
    height: 36,
  },
  dropdownButtonOpen: {
    borderColor: Colors.fhsuGold,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownButtonText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.fhsuGold,
    borderTopWidth: 0,
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
    shadowColor: Colors.fhsuBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2000,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 44,
    gap: Spacing.sm,
  },
  dropdownOptionActive: {
    backgroundColor: '#FFF9E6',
  },
  dropdownOptionText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
  },
  dropdownOptionTextActive: {
    fontWeight: '600',
    color: Colors.fhsuGold,
  },
  sortIconButton: {
    width: 28,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortIconButtonActive: {
    borderColor: Colors.fhsuGold,
    backgroundColor: '#FFF9E6',
  },
});