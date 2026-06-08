// @ts-nocheck
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Editor from '@monaco-editor/react';

export default function WorkspaceScreen() {
  const router = useRouter();
  const [code, setCode] = useState('// Write your code here...\nconsole.log("Hello, Layerwise!");\n');
  const [output, setOutput] = useState('');
  const [feedback, setFeedback] = useState('Hi! I am your AI Tutor. Write some code and hit "Evaluate" when you are ready.');
  const [loading, setLoading] = useState(false);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) setCode(value);
  };

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://layerwise-ai.onrender.com/api/workspace/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, language: 'javascript' })
      });
      const data = await res.json();
      
      if (res.ok) {
        setOutput(data.output);
        setFeedback(data.feedback);
      } else {
        setFeedback('Error: Could not connect to the evaluation server.');
      }
    } catch (err) {
      setFeedback('Error: Network issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back to Course</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Interactive Cloud Workspace</Text>
        <TouchableOpacity style={styles.runButton} onPress={handleEvaluate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.runText}>▶ Evaluate Code</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Editor Pane */}
        <View style={styles.editorPane}>
          {Platform.OS === 'web' ? (
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
          ) : (
            <View style={styles.fallback}>
              <Text style={{ color: '#fff' }}>Monaco Editor is only available on Web.</Text>
            </View>
          )}
        </View>

        {/* AI Tutor Panel */}
        <View style={styles.tutorPane}>
          <View style={styles.tutorHeader}>
            <Text style={styles.tutorTitle}>🤖 AI Tutor</Text>
          </View>
          <ScrollView style={styles.tutorScroll}>
            <View style={styles.chatBubble}>
              <Text style={styles.chatText}>{feedback}</Text>
            </View>
            
            {output ? (
              <View style={styles.outputBox}>
                <Text style={styles.outputLabel}>Terminal Output:</Text>
                <Text style={styles.outputText}>{output}</Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Deep slate background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  runButton: {
    backgroundColor: '#10B981', // Emerald green
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  runText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
  },
  editorPane: {
    flex: 2,
    borderRightWidth: 1,
    borderRightColor: '#334155',
  },
  tutorPane: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    backgroundColor: '#0F172A',
  },
  tutorTitle: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tutorScroll: {
    flex: 1,
    padding: 15,
  },
  chatBubble: {
    backgroundColor: '#3B82F6', // Vibrant blue
    padding: 15,
    borderRadius: 12,
    borderTopLeftRadius: 2,
    marginBottom: 20,
  },
  chatText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  outputBox: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  outputLabel: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 5,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  outputText: {
    color: '#10B981',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  }
});
