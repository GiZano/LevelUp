import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../utils/useThemeColors';
import { t } from '../utils/i18n';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';

const { width, height } = Dimensions.get('window');

type SlideData = {
  id: string;
  image: ImageSourcePropType;
  titleKey: string;
  descKey: string;
};

const slides: SlideData[] = [
  {
    id: '1',
    image: require('../../assets/tutorial_peaks.png'),
    titleKey: 'onboarding.slide1Title',
    descKey: 'onboarding.slide1Desc',
  },
  {
    id: '2',
    image: require('../../assets/tutorial_blocks.png'),
    titleKey: 'onboarding.slide2Title',
    descKey: 'onboarding.slide2Desc',
  },
  {
    id: '3',
    image: require('../../assets/tutorial_planner.png'),
    titleKey: 'onboarding.slide3Title',
    descKey: 'onboarding.slide3Desc',
  },
  {
    id: '4',
    image: require('../../assets/tutorial_today.png'),
    titleKey: 'onboarding.slide4Title',
    descKey: 'onboarding.slide4Desc',
  },
  {
    id: '5',
    image: require('../../assets/tutorial_settings.png'),
    titleKey: 'onboarding.slide5Title',
    descKey: 'onboarding.slide5Desc',
  },
];

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export default function OnboardingModal({ visible, onDismiss }: Props) {
  const { colors } = useThemeColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = React.useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewConfigRef = { viewAreaCoveragePercentThreshold: 50 };

  const renderItem = ({ item, index }: { item: SlideData; index: number }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} resizeMode="contain" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{t(item.titleKey)}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{t(item.descKey)}</Text>
        {index === slides.length - 1 && (
          <Pressable
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onDismiss}
          >
            <Text style={styles.buttonText}>{t('onboarding.dismissBtn')}</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {currentIndex < slides.length - 1 && (
          <Pressable style={styles.skipButton} onPress={onDismiss}>
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>
              {t('onboarding.skip')}
            </Text>
          </Pressable>
        )}
        <FlatList
          ref={flatListRef}
          data={slides}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          renderItem={renderItem}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfigRef}
        />
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === currentIndex ? colors.primary : colors.border },
                i === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  imageContainer: {
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: width * 0.75,
    height: height * 0.48,
    borderRadius: BorderRadius.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.lg,
    textAlign: 'center',
    lineHeight: 28,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: height * 0.05, // 5% from bottom
    width: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
  },
  button: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
});
