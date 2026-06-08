// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Editor from '@monaco-editor/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WorkspaceScreen() {
  const router = useRouter();
  const [code, setCode] = useState('// Write your code here...\nconsole.log("Hello, Layerwise!");\n');
  const [output, setOutput] = useState('Ready.\nClick "Run Code" to compile and execute.');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('console'); // 'console' or 'agent'

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) setCode(value);
  };

  const handleEvaluate = async () => {
    setLoading(true);
    setOutput('Compiling and executing...');
    setActiveTab('console');
    
    try {
      const token = await AsyncStorage.getItem('user_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('https://layerwise-ai.onrender.com/api/workspace/evaluate', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ code, language: 'javascript' }) 
      });
      const data = await res.json();
      
      if (res.ok) {
        setOutput(data.output || '(No output)');
      } else {
        setOutput('Error: Could not connect to the evaluation server.');
      }
    } catch (err) {
      setOutput('Error: Network issue connecting to compilation engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Interactive Cloud Workspace</Text>
        </View>
        <TouchableOpacity style={styles.runButton} onPress={handleEvaluate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.runText}>▶ Run Code</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Editor Pane (Left) */}
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

        {/* Console / Info Pane (Right) */}
        <View style={styles.rightPane}>
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'console' && styles.activeTab]}
                onPress={() => setActiveTab('console')}
            >
              <Text style={[styles.tabText, activeTab === 'console' && styles.activeTabText]}>_ Live Console</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'agent' && styles.activeTab]}
                onPress={() => setActiveTab('agent')}
            >
              <Text style={[styles.tabText, activeTab === 'agent' && styles.activeTabText]}>🤖 AI Agent</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <ScrollView style={styles.consoleScroll}>
            {activeTab === 'console' ? (
               <View style={styles.consoleBox}>
                 <Text style={styles.consoleOutput}>{output}</Text>
               </View>
            ) : (
               <View style={styles.agentBox}>
                 <Text style={styles.agentText}>
                    The global Floating AI Tutor is active! Click the robot icon in the top right to start chatting.
                 </Text>
               </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  backText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#E2E8F0',
    fontSize: 20,
    fontWeight: 'bold',
  },
  runButton: {
    backgroundColor: '#10B981', 
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
  },
  runText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightPane: {
    flex: 1,
    backgroundColor: '#0F172A',
    flexDirection: 'column',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#10B981',
  },
  tabText: {
    color: '#64748B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeTabText: {
    color: '#F8FAFC',
  },
  consoleScroll: {
    flex: 1,
    padding: 15,
  },
  consoleBox: {
    flex: 1,
  },
  consoleOutput: {
    color: '#10B981',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    lineHeight: 20,
  },
  agentBox: {
    padding: 20,
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  agentText: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 22,
  }
});
