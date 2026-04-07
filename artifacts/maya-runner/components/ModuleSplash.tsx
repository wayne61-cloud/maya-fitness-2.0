import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

type ModuleKey = "runner" | "workout" | "yoga" | "nutrition";

const SPLASH_IMAGES: Record<ModuleKey, ReturnType<typeof require>> = {
  runner: require("@/assets/images/splash-runner.png"),
  workout: require("@/assets/images/splash-workout.png"),
  yoga: require("@/assets/images/splash-yoga.png"),
  nutrition: require("@/assets/images/splash-nutrition.png"),
};

interface ModuleSplashProps {
  module: ModuleKey;
  onFinish: () => void;
  duration?: number;
}

export function ModuleSplash({ module, onFinish, duration = 3500 }: ModuleSplashProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(duration - 800),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Image
        source={SPLASH_IMAGES[module]}
        style={styles.image}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    width,
    height,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
