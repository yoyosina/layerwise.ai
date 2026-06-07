import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AdminModulesScreen() {
  const [modules, setModules] = useState<any[]>([]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [status, setStatus] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8005/api/admin/modules');
      const data = await res.json();
      if (data.modules) setModules(data.modules);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNew = async () => {
    setStatus('Saving...');
    try {
      const res = await fetch('http://127.0.0.1:8005/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: moduleTitle,
          order: modules.length + 1,
          tasks: [{ title: taskTitle, day: 1, resources: [{ type: 'link', url: resourceUrl, title: 'Resource Link' }] }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        setModules([...modules, data.module]);
        setStatus('Module added successfully!');
        setModuleTitle(''); setTaskTitle(''); setResourceUrl('');
      }
    } catch (err) {
      setStatus('Network error.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8005/api/admin/modules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setModules(modules.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8005/api/admin/modules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle })
      });
      if (res.ok) {
        setModules(modules.map(m => m.id === id ? { ...m, title: editTitle } : m));
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id: number) => {
    if (expandedModuleId === id) {
      setExpandedModuleId(null);
    } else {
      setExpandedModuleId(id);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Manage Modules</Text>

      {/* List Existing Modules */}
      <View style={styles.listCard}>
        <Text style={styles.sectionTitle}>Existing Modules</Text>
        {modules.map((mod) => (
          <View key={mod.id} style={styles.moduleCard}>
            <TouchableOpacity style={styles.moduleRow} onPress={() => toggleExpand(mod.id)}>
              {editingId === mod.id ? (
                <View style={styles.editRow}>
                  <TextInput 
                    style={styles.editInput} 
                    value={editTitle} 
                    onChangeText={setEditTitle} 
                  />
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleSaveEdit(mod.id)}>
                    <Text style={styles.btnText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => setEditingId(null)}>
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.viewRow}>
                  <Text style={styles.moduleTitleText}>{mod.title}</Text>
                  <View style={styles.actions}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.editBtn]} 
                      onPress={(e) => { e.stopPropagation(); setEditingId(mod.id); setEditTitle(mod.title); }}>
                      <Text style={styles.btnText}>Rename</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={(e) => { e.stopPropagation(); handleDelete(mod.id); }}>
                      <Text style={styles.btnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* Expandable Tasks Section */}
            {expandedModuleId === mod.id && (
              <View style={styles.tasksContainer}>
                <Text style={styles.tasksHeader}>Lessons & Tasks</Text>
                {mod.tasks && mod.tasks.length > 0 ? (
                  mod.tasks.map((task: any, index: number) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.taskItem}
                      onPress={() => router.push(`/admin/tasks/${task.id}`)}
                    >
                      <Text style={styles.taskText}>{task.title}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noTasks}>No tasks found for this module.</Text>
                )}
                <TouchableOpacity style={styles.addTaskBtn}>
                  <Text style={styles.addTaskBtnText}>+ Add Lesson</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Add New Module Form */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Add New Module</Text>
        <TextInput style={styles.input} placeholder="Module Title (e.g. Vibe Coding)" value={moduleTitle} onChangeText={setModuleTitle} />
        <TextInput style={styles.input} placeholder="Task Title (e.g. Day 1: Basics)" value={taskTitle} onChangeText={setTaskTitle} />
        <TextInput style={styles.input} placeholder="Resource URL (YouTube, PDF link)" value={resourceUrl} onChangeText={setResourceUrl} />
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveNew}>
          <Text style={styles.saveButtonText}>SAVE MODULE</Text>
        </TouchableOpacity>
        {status ? <Text style={styles.status}>{status}</Text> : null}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 30, marginTop: 40 },
  listCard: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 12, marginBottom: 20 },
  formCard: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  moduleCard: { backgroundColor: '#2a2a2a', borderRadius: 8, marginBottom: 10, overflow: 'hidden' },
  moduleRow: { padding: 15 },
  viewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editRow: { flexDirection: 'row', alignItems: 'center' },
  moduleTitleText: { color: '#fff', fontSize: 16, flex: 1, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#444' },
  editBtn: { backgroundColor: '#6200ee' },
  deleteBtn: { backgroundColor: '#ff5252' },
  cancelBtn: { backgroundColor: '#555' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  editInput: { flex: 1, backgroundColor: '#444', color: '#fff', padding: 8, borderRadius: 6, marginRight: 10 },
  tasksContainer: { backgroundColor: '#333', padding: 15, borderTopWidth: 1, borderTopColor: '#444' },
  tasksHeader: { color: '#bbb', fontSize: 14, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  taskItem: { backgroundColor: '#444', padding: 12, borderRadius: 6, marginBottom: 8 },
  taskText: { color: '#fff', fontSize: 15 },
  noTasks: { color: '#aaa', fontStyle: 'italic', marginBottom: 10 },
  addTaskBtn: { marginTop: 5, alignSelf: 'flex-start' },
  addTaskBtnText: { color: '#03dac6', fontWeight: 'bold', fontSize: 14 },
  input: { backgroundColor: '#333', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 15 },
  saveButton: { backgroundColor: '#03dac6', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  status: { color: '#ff9800', marginTop: 15, textAlign: 'center' },
  backButton: { marginTop: 20, padding: 15, alignItems: 'center' },
  backButtonText: { color: '#aaa', fontSize: 16 }
});
