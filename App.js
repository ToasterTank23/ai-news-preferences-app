import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [preferences, setPreferences] = useState([]);
  const [topicInput, setTopicInput] = useState('');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    if (preferences.length > 0) {
      fetchNews();
    }
  }, [preferences]);

  const loadPreferences = async () => {
    try {
      const prefs = await AsyncStorage.getItem('preferences');
      if (prefs) {
        setPreferences(JSON.parse(prefs));
      }
    } catch (e) {
      console.error('Failed to load preferences', e);
    }
  };

  const savePreferences = async (newPrefs) => {
    try {
      await AsyncStorage.setItem('preferences', JSON.stringify(newPrefs));
    } catch (e) {
      console.error('Failed to save preferences', e);
    }
  };

  const addPreference = () => {
    if (topicInput.trim() !== '') {
      const newPrefs = [...preferences, topicInput.trim()];
      setPreferences(newPrefs);
      savePreferences(newPrefs);
      setTopicInput('');
    }
  };

  const removePreference = (topic) => {
    const newPrefs = preferences.filter(p => p !== topic);
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  const fetchNews = async () => {
    try {
      const query = preferences.join(' OR ');
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&apiKey=YOUR_NEWSAPI_KEY`;
      const response = await fetch(url);
      const json = await response.json();
      setArticles(json.articles || []);
    } catch (e) {
      console.error('Failed to fetch news', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>AI News Preferences App</Text>
      <View style={styles.preferenceInput}>
        <TextInput
          value={topicInput}
          onChangeText={setTopicInput}
          placeholder="Add topic (e.g., machine learning)"
          style={styles.input}
        />
        <Button title="Add" onPress={addPreference} />
      </View>
      <FlatList
        data={preferences}
        keyExtractor={(item) => item}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => removePreference(item)}>
            <View style={styles.preferenceChip}>
              <Text style={styles.preferenceText}>{item}</Text>
            </View>
          </TouchableOpacity>
        )}
        style={styles.preferencesList}
      />
      <FlatList
        data={articles}
        keyExtractor={(item) => item.url}
        renderItem={({ item }) => (
          <View style={styles.article}>
            <Text style={styles.articleTitle}>{item.title}</Text>
            <Text style={styles.articleSource}>{item.source?.name}</Text>
          </View>
        )}
        style={styles.articlesList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  preferenceInput: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginRight: 8,
    borderRadius: 4,
  },
  preferencesList: {
    marginBottom: 16,
  },
  preferenceChip: {
    backgroundColor: '#eee',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  preferenceText: {
    fontSize: 14,
  },
  articlesList: {
    flex: 1,
  },
  article: {
    marginBottom: 12,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  articleSource: {
    fontSize: 12,
    color: '#666',
  },
});
