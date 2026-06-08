// @ts-nocheck
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';

export default function AdminTaskDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Title State
  const [taskTitle, setTaskTitle] = useState(`Lesson/Task ID: ${id}`);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  // Content State
  const [description, setDescription] = useState("This module introduces the core foundations of the subject. You will learn the base principles, required tools, and setup your local environment to proceed with the curriculum successfully.");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  
  const [resourceLink, setResourceLink] = useState("https://www.youtube.com/watch?v=mock-video-id");
  const [isEditingResource, setIsEditingResource] = useState(false);

  const [evalParams, setEvalParams] = useState("Explain the primary architecture of the system.\\nWhat are the 3 main failure points you must catch?\\nDemonstrate a working localized setup.");
  const [isEditingEval, setIsEditingEval] = useState(false);

  const [additionalMat, setAdditionalMat] = useState("https://docs.example.com/additional-reading-material.pdf");
  const [isEditingAdd, setIsEditingAdd] = useState(false);

  useEffect(() => {
    fetch('https://layerwise-ai.onrender.com/api/curriculum/modules', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        let found = false;
        for (const mod of data.modules) {
          for (const t of mod.tasks) {
            if (t.id.toString() === id?.toString()) {
              setTaskTitle(t.title);
              setEditedTitle(t.title);
              if (t.resource_link) {
                setResourceLink(t.resource_link);
              } else {
                setResourceLink('No resource linked.');
              }
              found = true;
              break;
            }
          }
          if (found) break;
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  const renderEditHeader = (title: string, isEditing: boolean, setEditing: (v: boolean) => void) => (
    <View style={styles.boxHeaderContainer}>
      <Text style={styles.boxHeader}>{title}</Text>
      {!isEditing && (
        <TouchableOpacity style={styles.traditionalEditBtn} onPress={() => setEditing(true)}>
          <Text style={styles.traditionalEditBtnText}>Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back to Modules</Text>
        </TouchableOpacity>
        
        {/* Title Box */}
        <View style={[styles.box, { marginBottom: 25, padding: 15 }]}>
          {isEditingTitle ? (
            <View style={styles.editContainer}>
              <TextInput 
                style={styles.titleInput} 
                value={editedTitle} 
                onChangeText={setEditedTitle} 
                autoFocus
              />
              <TouchableOpacity style={styles.saveButton} onPress={() => { setTaskTitle(editedTitle); setIsEditingTitle(false); }}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditingTitle(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.boxHeaderContainer}>
              <Text style={[styles.title, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
                {taskTitle}
              </Text>
              <TouchableOpacity style={styles.traditionalEditBtn} onPress={() => setIsEditingTitle(true)}>
                <Text style={styles.traditionalEditBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Box 1: Description */}
        <View style={styles.box}>
          {renderEditHeader("Module Description", isEditingDesc, setIsEditingDesc)}
          {isEditingDesc ? (
            <View>
              <TextInput style={styles.multilineInput} multiline value={description} onChangeText={setDescription} />
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.saveButton} onPress={() => setIsEditingDesc(false)}><Text style={styles.saveButtonText}>Save</Text></TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.boxContent}>{description}</Text>
          )}
        </View>

        {/* Box 2: Resource Link */}
        <View style={styles.box}>
          {renderEditHeader("Resource Link", isEditingResource, setIsEditingResource)}
          {isEditingResource ? (
            <View>
              <TextInput style={styles.singleLineInput} value={resourceLink} onChangeText={setResourceLink} />
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.saveButton} onPress={() => setIsEditingResource(false)}><Text style={styles.saveButtonText}>Save</Text></TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.linkText}>{resourceLink}</Text>
          )}
        </View>

        {/* Box 3: Evaluation Parameters */}
        <View style={styles.box}>
          {renderEditHeader("Evaluation Parameters", isEditingEval, setIsEditingEval)}
          {isEditingEval ? (
            <View>
              <TextInput style={styles.multilineInput} multiline value={evalParams} onChangeText={setEvalParams} />
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.saveButton} onPress={() => setIsEditingEval(false)}><Text style={styles.saveButtonText}>Save</Text></TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              {evalParams.split('\\n').map((param, index) => (
                <Text key={index} style={styles.listItem}>• {param}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Box 4: Additional Material */}
        <View style={styles.box}>
          {renderEditHeader("Additional Material (Optional)", isEditingAdd, setIsEditingAdd)}
          {isEditingAdd ? (
            <View>
              <TextInput style={styles.singleLineInput} value={additionalMat} onChangeText={setAdditionalMat} />
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.saveButton} onPress={() => setIsEditingAdd(false)}><Text style={styles.saveButtonText}>Save</Text></TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.linkText}>{additionalMat}</Text>
          )}
        </View>

        {/* Box 5: Graduation Quiz */}
        <View style={styles.box}>
          <Text style={styles.boxHeader}>Graduation Quiz (10 MCQs)</Text>
          <Text style={styles.boxContent}>Add the 10 multiple-choice questions that the student must pass (75% score) to graduate from this lesson.</Text>
          <TouchableOpacity style={styles.addQuizButton}>
            <Text style={styles.addQuizButtonText}>+ ADD/EDIT QUIZ QUESTIONS</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  backButton: { marginBottom: 20, marginTop: 20 },
  backText: { color: '#03dac6', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  editContainer: { flexDirection: 'row', alignItems: 'center' },
  titleInput: { flex: 1, backgroundColor: '#2c2c2c', color: '#fff', fontSize: 18, padding: 10, borderRadius: 8, marginRight: 10 },
  multilineInput: { backgroundColor: '#2c2c2c', color: '#fff', fontSize: 15, padding: 15, borderRadius: 8, minHeight: 100, textAlignVertical: 'top', marginBottom: 10 },
  singleLineInput: { backgroundColor: '#2c2c2c', color: '#fff', fontSize: 15, padding: 12, borderRadius: 8, marginBottom: 10 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  saveButton: { backgroundColor: '#03dac6', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, marginRight: 10 },
  saveButtonText: { color: '#000', fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#ff5252', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
  box: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333'
  },
  boxHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  boxHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bb86fc',
  },
  traditionalEditBtn: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#444'
  },
  traditionalEditBtnText: {
    color: '#03dac6',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  boxContent: {
    color: '#ddd',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10
  },
  linkText: {
    color: '#03dac6',
    fontSize: 15,
    textDecorationLine: 'underline'
  },
  listItem: {
    color: '#ddd',
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 22
  },
  addQuizButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  addQuizButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  contextMenu: {
    position: 'absolute',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 5,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#444'
  },
  contextMenuItem: {
    padding: 12,
  },
  contextMenuText: {
    color: '#fff',
    fontSize: 16,
  }
});
