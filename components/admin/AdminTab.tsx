import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes } from '@/constants/theme';

interface AdminTabsProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

export default function AdminTabs({ activeTab, onChange }: AdminTabsProps) {
  return (
    <View style={styles.tabsContainer}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onChange(tab.key)}
          >
            <View style={styles.tabContent}>
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.underline} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'events', label: 'Manage Events' }
];

const styles = StyleSheet.create({
  tabsContainer: {
    backgroundColor: Colors.fhsuWhite,
    flexDirection: 'row',
    marginTop: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1, // makes tabs evenly spaced
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '700',
  },
  underline: {
    marginTop: 8,
    height: 3,
    alignSelf: 'stretch',
    backgroundColor: Colors.fhsuGold,
    borderRadius: 2,
  },
  activeTab: {},
});
