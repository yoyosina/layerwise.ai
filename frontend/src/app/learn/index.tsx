import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LearnScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();
  
  const [curriculum, setCurriculum] = useState([]);
  const [progress, setProgress] = useState(null);
  const [videoProgress, setVideoProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('user_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const [currRes, progRes, vidProgRes] = await Promise.all([
          fetch('https://layerwise-ai.onrender.com/api/curriculum/modules', { headers }),
          fetch('https://layerwise-ai.onrender.com/api/student/progress', { headers }),
          fetch('https://layerwise-ai.onrender.com/api/student/video-progress-all', { headers })
        ]);
        const currData = await currRes.json();
        const progData = await progRes.json();
        const vidProgData = await vidProgRes.json();
        
        setCurriculum(currData.modules || []);
        setProgress(progData);
        setVideoProgress(vidProgData || []);
        
        if (progData) {
          setExpandedModules({ [progData.current_module_id]: true });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleModule = (moduleId) => {
    if (progress && moduleId <= progress.current_module_id + 1) {
      setExpandedModules(prev => ({
        ...prev,
        [moduleId]: !prev[moduleId]
      }));
    }
  };

  const getIconForLesson = (task) => {
    if (!task.resource_link) return '📖';
    const link = task.resource_link.toLowerCase();
    if (link.includes('youtube') || link.includes('youtu.be') || link.includes('video')) {
      return '🎥';
    }
    return '📖';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#58cc02" />
      </View>
    );
  }

  const renderRoadmap = () => {
    return (
      <ScrollView style={styles.centerColumn} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.logo}>Layerwise</Text>
        {curriculum.map((module, mIdx) => {
          const isPastModule = progress && module.id < progress.current_module_id;
          const isCurrentModule = progress && module.id === progress.current_module_id;
          const isNextModule = progress && module.id === progress.current_module_id + 1;
          const isHardLocked = progress && module.id > progress.current_module_id + 1;
          
          const isExpanded = !!expandedModules[module.id];
          const moduleEmojis = ['🌟', '🚀', '🧠', '⚡', '🏆', '👑'];
          const moduleEmoji = moduleEmojis[mIdx % moduleEmojis.length];

          return (
            <View key={module.id} style={styles.moduleSection}>
              <TouchableOpacity 
                style={[styles.moduleHeader, isHardLocked && styles.moduleHeaderLocked]}
                onPress={() => toggleModule(module.id)}
                activeOpacity={isHardLocked ? 1 : 0.7}
              >
                <View style={styles.moduleHeaderContent}>
                  <View style={[styles.moduleIconBox, isHardLocked && styles.moduleIconBoxLocked]}>
                    <Text style={styles.moduleIcon}>{isHardLocked ? '🔒' : moduleEmoji}</Text>
                  </View>
                  <View style={styles.moduleTextContainer}>
                    <Text style={[styles.moduleTitle, isHardLocked && styles.lockedText]}>Module {module.id}</Text>
                    <Text style={[styles.moduleSubtitle, isHardLocked && styles.lockedText]}>{module.title}</Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              {isExpanded && (
                <View style={styles.pathContainer}>
                  {module.tasks.map((task, index) => {
                    const isLessonUnlocked = isPastModule || (isCurrentModule && task.day <= progress.current_day);
                    const isCompleted = isPastModule || (isCurrentModule && task.day < progress.current_day);
                    
                    const positions = [0, 50, 0, -50];
                    const translateX = positions[index % 4];

                    const taskVidProg = videoProgress.find(vp => vp.task_id === task.id);
                    let percentageStr = null;
                    if (taskVidProg && taskVidProg.duration_seconds > 0) {
                      const perc = Math.round((taskVidProg.progress_seconds / taskVidProg.duration_seconds) * 100);
                      if (perc > 0) {
                        percentageStr = `${perc}%`;
                      }
                    }

                    return (
                      <View key={task.id} style={[styles.nodeRow, { transform: [{ translateX }] }]}>
                        <TouchableOpacity 
                          style={[
                            styles.lessonNode, 
                            isCompleted ? styles.nodeCompleted : (isLessonUnlocked ? styles.nodeUnlocked : styles.nodeLocked)
                          ]}
                          disabled={!isLessonUnlocked}
                          onPress={() => router.push(`/student/lesson/${task.id}`)}
                        >
                          <View style={styles.lessonIconContainer}>
                            {isCompleted && <View style={styles.checkBadge}><Text style={styles.checkBadgeText}>✓</Text></View>}
                            {!isLessonUnlocked && <View style={styles.lockBadge}><Text style={styles.lockBadgeText}>🔒</Text></View>}
                            <Text style={[styles.lessonEmoji, !isLessonUnlocked && styles.lockedEmoji]}>
                              {getIconForLesson(task)}
                            </Text>
                          </View>
                          <Text style={styles.lessonDayLabel}>Day {task.day}</Text>
                          {percentageStr && (
                            <Text style={styles.percentageLabel}>{percentageStr}</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}

                  <View style={[styles.nodeRow, { justifyContent: 'center', marginTop: 20 }]}>
                    <TouchableOpacity 
                      style={[
                        styles.examNode, 
                        isCurrentModule && progress.current_day > module.tasks.length ? styles.examReady : styles.examLocked
                      ]}
                      disabled={!(isCurrentModule && progress.current_day > module.tasks.length)}
                      onPress={() => router.push(`/student/quiz/module-test?moduleId=${module.id}`)}
                    >
                      <Text style={styles.examEmoji}>🎓</Text>
                      <Text style={styles.examLabel}>Module Exam</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const menuItems = [
    { name: 'LEARN', icon: '🏠' },
    { name: 'PRACTICE', icon: '🏋️' },
    { name: 'LEADERBOARDS', icon: '🛡️' },
    { name: 'QUESTS', icon: '📜' },
    { name: 'SHOP', icon: '🏪' },
    { name: 'PROFILE', icon: '👤' },
    { name: 'MORE', icon: '⋯' },
  ];

  const renderLeftSidebar = () => (
    <View style={styles.leftSidebar}>
      <Text style={styles.logo}>Layerwise</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={item.name} style={[styles.menuItem, index === 0 && styles.menuItemActive]}>
            <Text style={styles.menuIconText}>{item.icon}</Text>
            <Text style={[styles.menuText, index === 0 && styles.menuTextActive]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBottomTab = () => (
    <View style={styles.bottomTab}>
      {menuItems.slice(0, 5).map((item, index) => (
        <TouchableOpacity key={item.name} style={[styles.bottomTabItem, index === 0 && styles.bottomTabItemActive]}>
          <Text style={styles.bottomTabIcon}>{item.icon}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStatsRow = () => (
    <View style={styles.statsRow}>
      <View style={styles.stat}><Text style={styles.statIcon}>🇩🇪</Text><Text style={styles.statText}>10</Text></View>
      <View style={styles.stat}><Text style={styles.statIcon}>🔥</Text><Text style={styles.statText}>54</Text></View>
      <View style={styles.stat}><Text style={styles.statIcon}>💎</Text><Text style={styles.statText}>518</Text></View>
      <View style={styles.stat}><Text style={styles.statIcon}>❤️</Text><Text style={styles.statText}>5</Text></View>
    </View>
  );

  const renderRightSidebar = () => (
    <View style={styles.rightSidebar}>
      {renderStatsRow()}
      <View style={styles.superCard}>
        <Text style={styles.superTitle}>SUPER</Text>
        <Text style={styles.superSubtitle}>Try Super for free</Text>
        <Text style={styles.superDesc}>No ads, personalized practice, and unlimited Legendary!</Text>
        <TouchableOpacity style={styles.superBtn}><Text style={styles.superBtnText}>TRY 1 WEEK FREE</Text></TouchableOpacity>
      </View>
      <View style={styles.leagueCard}>
        <Text style={styles.leagueTitle}>Ruby League</Text>
        <View style={styles.leagueContent}>
          <Text style={styles.leagueIcon}>🛡️</Text>
          <View style={styles.leagueTextWrapper}>
            <Text style={styles.leagueRank}>You're ranked #1</Text>
            <Text style={styles.leagueDesc}>Keep it up to stay in the top 3!</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTopHeader = () => (
    <View style={styles.topHeader}>
      {renderStatsRow()}
    </View>
  );

  return (
    <View style={styles.container}>
      {isDesktop ? (
        <View style={styles.desktopLayout}>
          {renderLeftSidebar()}
          {renderRoadmap()}
          {renderRightSidebar()}
        </View>
      ) : (
        <View style={styles.mobileLayout}>
          {renderTopHeader()}
          {renderRoadmap()}
          {renderBottomTab()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  mobileLayout: {
    flex: 1,
    flexDirection: 'column',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // --- Left Sidebar (Desktop) ---
  leftSidebar: {
    width: 250,
    borderRightWidth: 1,
    borderRightColor: '#333333',
    paddingTop: 30,
    paddingHorizontal: 15,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#58cc02',
    marginBottom: 40,
    paddingLeft: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 5,
  },
  menuItemActive: {
    backgroundColor: 'rgba(88, 204, 2, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(88, 204, 2, 0.3)',
  },
  menuIconText: {
    fontSize: 24,
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#aaaaaa',
  },
  menuTextActive: {
    color: '#58cc02',
  },

  // --- Right Sidebar (Desktop) ---
  rightSidebar: {
    width: 350,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginRight: 5,
  },
  statText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  superCard: {
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  superTitle: {
    color: '#ce82ff',
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 16,
    marginBottom: 10,
  },
  superSubtitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  superDesc: {
    color: '#aaaaaa',
    lineHeight: 20,
    marginBottom: 20,
  },
  superBtn: {
    backgroundColor: '#ce82ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  superBtnText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 16,
  },
  leagueCard: {
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 15,
    padding: 20,
  },
  leagueTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 15,
  },
  leagueContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leagueIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  leagueTextWrapper: {
    flex: 1,
  },
  leagueRank: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  leagueDesc: {
    color: '#aaaaaa',
    marginTop: 5,
  },

  // --- Top Header & Bottom Tab (Mobile) ---
  topHeader: {
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    backgroundColor: '#121212',
  },
  bottomTab: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    backgroundColor: '#121212',
    paddingVertical: 15,
    justifyContent: 'space-around',
  },
  bottomTabItem: {
    padding: 10,
    borderRadius: 10,
  },
  bottomTabItemActive: {
    backgroundColor: 'rgba(88, 204, 2, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(88, 204, 2, 0.3)',
  },
  bottomTabIcon: {
    fontSize: 24,
  },

  // --- Center Column Roadmap ---
  centerColumn: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  moduleSection: {
    marginBottom: 20,
  },
  moduleHeader: {
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#333333',
  },
  moduleHeaderLocked: {
    backgroundColor: '#1a1a1a',
    borderColor: '#222222',
  },
  moduleHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#58cc02',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 5,
    shadowColor: '#58cc02',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: '#46a302',
    borderBottomWidth: 6,
  },
  moduleIconBoxLocked: {
    backgroundColor: '#333333',
    shadowOpacity: 0,
    elevation: 0,
  },
  moduleIcon: {
    fontSize: 35,
  },
  moduleTextContainer: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bb86fc',
    textTransform: 'uppercase',
  },
  moduleSubtitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 4,
  },
  lockedText: {
    color: '#666666',
  },
  pathContainer: {
    marginTop: 20,
    paddingVertical: 20,
    alignItems: 'center',
    position: 'relative',
  },
  nodeRow: {
    width: '100%',
    flexDirection: 'row',
    marginVertical: 15,
    justifyContent: 'center',
  },
  lessonNode: {
    width: 85,
    height: 85,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  nodeCompleted: {
    borderColor: '#e5b400',
    backgroundColor: '#ffc800',
    borderBottomWidth: 8,
    shadowColor: '#ffc800',
  },
  nodeUnlocked: {
    borderColor: '#46a302',
    backgroundColor: '#58cc02',
    borderBottomWidth: 8,
    shadowColor: '#58cc02',
  },
  nodeLocked: {
    borderColor: '#222222',
    backgroundColor: '#333333',
    borderBottomWidth: 8,
    shadowOpacity: 0,
    elevation: 0,
  },
  lessonIconContainer: {
    position: 'relative',
  },
  lessonEmoji: {
    fontSize: 32,
  },
  lockedEmoji: {
    opacity: 0.4,
  },
  checkBadge: {
    position: 'absolute',
    top: -10,
    right: -15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  checkBadgeText: {
    color: '#ffc800',
    fontWeight: '900',
    fontSize: 14,
  },
  lockBadge: {
    position: 'absolute',
    top: -10,
    right: -15,
    backgroundColor: '#333333',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  lockBadgeText: {
    fontSize: 12,
  },
  lessonDayLabel: {
    position: 'absolute',
    bottom: -25,
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    width: 100,
  },
  percentageLabel: {
    position: 'absolute',
    bottom: -45,
    color: '#ce82ff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    width: 100,
  },
  examNode: {
    width: 100,
    height: 80,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },
  examReady: {
    borderColor: '#ce82ff',
    backgroundColor: '#1e1e1e',
  },
  examLocked: {
    borderColor: '#333333',
    backgroundColor: '#1a1a1a',
  },
  examEmoji: {
    fontSize: 30,
  },
  examLabel: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 5,
  }
});
