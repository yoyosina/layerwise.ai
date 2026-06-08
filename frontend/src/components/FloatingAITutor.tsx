import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FloatingAITutor() {
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();
  
  const translateX = useSharedValue(350); // Hidden by default

  const togglePanel = () => {
    if (isOpen) {
      translateX.value = withSpring(350, { damping: 20, stiffness: 90 });
    } else {
      translateX.value = withSpring(0, { damping: 20, stiffness: 90 });
    }
    setIsOpen(!isOpen);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }]
    };
  });

  return (
    <>
      <Animated.View style={[styles.panel, animatedStyle, { top: insets.top + 20, bottom: insets.bottom + 20 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>🤖 AI Tutor</Text>
          <TouchableOpacity onPress={togglePanel}>
            <Text style={styles.closeBtn}>✖</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scroll}>
          <View style={styles.chatBubble}>
            <Text style={styles.chatText}>
              I'm always here to help! Whether you're stuck on a video concept or need help debugging your code, just ask.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>

      {!isOpen && (
        <TouchableOpacity 
          style={[styles.floatingBtn, { bottom: insets.bottom + 20 }]} 
          onPress={togglePanel}
        >
          <Text style={styles.floatingText}>🤖 Ask AI</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    right: 20,
    width: 320,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    overflow: 'hidden',
    zIndex: 1000,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : {})
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    color: '#94A3B8',
    fontSize: 18,
  },
  scroll: {
    flex: 1,
    padding: 15,
  },
  chatBubble: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 12,
    borderTopLeftRadius: 2,
  },
  chatText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  floatingBtn: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 999,
  },
  floatingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
