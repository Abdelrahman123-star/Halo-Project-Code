/**
 * WardrobeDropdownField — Accessible custom frosted dropdown selector.
 * Built with `ui-ux-pro-max` guidelines: explicit label, >=44px touch targets,
 * crisp SVG chevron & checkmark icons (zero emoji icons), and smooth press feedback.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface WardrobeDropdownFieldProps {
  label: string;
  selectedValue: string;
  placeholder?: string;
  options: DropdownOption[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}

export function WardrobeDropdownField({
  label,
  selectedValue,
  placeholder = 'Select an option',
  options,
  isOpen,
  onToggle,
  onSelect,
}: WardrobeDropdownFieldProps): React.JSX.Element {
  const activeOption = options.find(
    (opt) => opt.value.toLowerCase() === selectedValue.toLowerCase(),
  );
  const displayLabel = activeOption
    ? activeOption.label
    : selectedValue
      ? selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1)
      : placeholder;

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${displayLabel}`}
        style={({ pressed }) => [
          styles.trigger,
          isOpen && styles.triggerOpen,
          pressed && styles.triggerPressed,
        ]}
      >
        <Text
          style={[
            styles.triggerText,
            !activeOption && !selectedValue && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {displayLabel}
        </Text>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path
            d={isOpen ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}
            stroke="#6B5299"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>

      {isOpen ? (
        <View style={styles.menu}>
          {options.map((opt, idx) => {
            const isSelected = opt.value.toLowerCase() === selectedValue.toLowerCase();
            const isLast = idx === options.length - 1;
            return (
              <Pressable
                key={`${opt.value}-${idx}`}
                onPress={() => onSelect(opt.value)}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.optionRow,
                  !isLast && styles.optionDivider,
                  isSelected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {opt.label}
                </Text>
                {isSelected ? (
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 6L9 17l-5-5"
                      stroke="#686EE8"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { gap: 5 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F3E6A',
    letterSpacing: 0.2,
  },
  trigger: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.2,
    borderColor: 'rgba(185, 170, 222, 0.55)',
    gap: 8,
  },
  triggerOpen: {
    borderColor: '#8B7BEF',
    backgroundColor: '#FFFFFF',
  },
  triggerPressed: { opacity: 0.85 },
  triggerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#2E2242',
    textTransform: 'capitalize',
  },
  placeholderText: {
    color: '#8D7CA6',
    fontWeight: '500',
  },
  menu: {
    marginTop: 4,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(139, 123, 239, 0.35)',
    overflow: 'hidden',
    shadowColor: '#8C78B3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  optionRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 207, 241, 0.35)',
  },
  optionSelected: {
    backgroundColor: 'rgba(139, 123, 239, 0.11)',
  },
  optionPressed: {
    backgroundColor: 'rgba(139, 123, 239, 0.06)',
  },
  optionText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#3D3055',
    textTransform: 'capitalize',
  },
  optionTextSelected: {
    fontWeight: '700',
    color: '#5746AF',
  },
});

