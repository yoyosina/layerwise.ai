import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput, KeyboardAvoidingView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FloatingAITutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([
    { role: 'ai', text: "I'm always here to help! Whether you're stuck on a video concept or need help debugging your code, just ask." }
  ]);
  const scrollViewRef = useRef<ScrollView>(null);
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

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;
    
    const userMsg = { role: 'user', text: inputText };
    const updatedHistory = [...history, userMsg];
    setHistory(updatedHistory);
    setInputText('');
    setIsGenerating(true);

    // Add empty AI message container for streaming
    setHistory(prev => [...prev, { role: 'ai', text: '' }]);
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await fetch('https://layerwise-ai.onrender.com/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: updatedHistory })
      });

      if (Platform.OS === 'web') {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        if (reader) {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim();
                if (dataStr === '[DONE]') break;
                try {
                  const data = JSON.parse(dataStr);
                  setHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1].text += data.content;
                    return newHistory;
                  });
                  scrollViewRef.current?.scrollToEnd({ animated: false });
                } catch (e) {}
              }
            }
          }
        }
      } else {
        // Fallback for native where streams are tricky
        const text = await response.text();
        const lines = text.split('\n\n');
        let fullText = "";
        for (const line of lines) {
           if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr !== '[DONE]') {
                 try { fullText += JSON.parse(dataStr).content; } catch(e){}
              }
           }
        }
        setHistory(prev => {
           const newHistory = [...prev];
           newHistory[newHistory.length - 1].text = fullText;
           return newHistory;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setHistory(prev => {
         const newHistory = [...prev];
         newHistory[newHistory.length - 1].text = "Error connecting to AI. Please try again.";
         return newHistory;
      });
    } finally {
      setIsGenerating(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <>
      <Animated.View style={[styles.panel, animatedStyle, { top: insets.top + 20, bottom: insets.bottom + 20 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>🤖 AI Tutor</Text>
          <TouchableOpacity onPress={togglePanel}>
            <Text style={styles.closeBtn}>✖</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scroll} ref={scrollViewRef} contentContainerStyle={{ paddingBottom: 20 }}>
          {history.map((msg, idx) => (
            <View key={idx} style={[styles.bubbleWrapper, msg.role === 'user' ? styles.userWrapper : styles.aiWrapper]}>
              <View style={[styles.chatBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={styles.chatText}>{msg.text}</Text>
              </View>
            </View>
          ))}
          {isGenerating && history[history.length - 1].text === '' && (
            <Text style={styles.typingText}>AI is thinking...</Text>
          )}
        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Ask a question..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={isGenerating || !inputText.trim()}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    width: 350,
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
    backgroundColor: '#1E293B',
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
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  aiWrapper: {
    justifyContent: 'flex-start',
  },
  chatBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
  },
  aiBubble: {
    backgroundColor: '#3B82F6',
    borderTopLeftRadius: 2,
  },
  userBubble: {
    backgroundColor: '#475569',
    borderTopRightRadius: 2,
  },
  chatText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  typingText: {
    color: '#94A3B8',
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 10,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#1E293B',
  },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: '#03dac6',
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendBtnText: {
    color: '#000',
    fontWeight: 'bold',
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
