import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Lottie, { type LottieViewProps } from 'lottie-react-native';
import { lottieAnimations } from '@/assets/illustrations';

type Group = keyof typeof lottieAnimations;
type SourceFor<G extends Group> = keyof (typeof lottieAnimations)[G];

type Props<G extends Group> = Omit<LottieViewProps, 'source'> & {
  group: G;
  name: SourceFor<G>;
  size?: number;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Theme-agnostic Lottie wrapper. Picks an animation by group + name so
 * components don't reach into asset paths directly.
 *
 *   <LottieAnimation group="success" name="saved" size={120} />
 */
export function LottieAnimation<G extends Group>({
  group,
  name,
  size = 160,
  containerStyle,
  autoPlay = true,
  loop = true,
  ...rest
}: Props<G>) {
  const source = (lottieAnimations[group] as Record<string, unknown>)[name as string];

  return (
    <View style={[{ width: size, height: size }, containerStyle]}>
      <Lottie
        source={source as LottieViewProps['source']}
        autoPlay={autoPlay}
        loop={loop}
        style={{ width: '100%', height: '100%' }}
        {...rest}
      />
    </View>
  );
}
