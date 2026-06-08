// @ts-nocheck
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: 1, text: "I am The Deep-Tech Instructor. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), text: input, isBot: false };
    setMessages([...messages, newMsg]);
    setInput('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now()+1, 
        text: "Think about the architecture. Why would we use a Vector DB instead of a Relational DB here?", 
        isBot: true 
      }]);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tutor Chat</Text>
      </View>
      <ScrollView style={styles.chatArea} contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.map(msg => (
          <View key={msg.id} style={msg.isBot ? styles.botRow : styles.userRow}>
            {msg.isBot && (
              <View style={styles.botAvatar}>
                <Text style={styles.avatarText}>🦉</Text>
              </View>
            )}
            <View style={[styles.messageBubble, msg.isBot ? styles.botBubble : styles.userBubble]}>
              <Text style={[styles.messageText, msg.isBot ? styles.botText : styles.userText]}>{msg.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          value={input} 
          onChangeText={setInput} 
          placeholder="Ask a question..."
          placeholderTextColor="#AFAFAF"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>SEND</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#208AEF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  chatArea: {
    flex: 1,
    padding: 20,
  },
  botRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  userRow: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 20,
  },
  messageBubble: {
    padding: 15,
    borderRadius: 20,
    maxWidth: '75%',
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#1CB0F6',
    borderBottomRightRadius: 4,
    borderWidth: 2,
    borderColor: '#1899D6',
  },
  messageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  botText: {
    color: '#3C3C3C',
  },
  userText: {
    color: '#fff',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    color: '#3C3C3C',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 50,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    fontSize: 16,
    fontWeight: '500',
  },
  sendButton: {
    backgroundColor: '#1CB0F6',
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 16,
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderColor: '#1899D6',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  }
});
