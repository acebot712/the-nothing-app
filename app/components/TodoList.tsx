import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../../utils/supabase';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTodos = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('todos').select('*');

        if (error) {
          console.error('Error fetching todos:', error.message);
          setError(error.message);
          return;
        }

        if (data) {
          setTodos(data as Todo[]);
        }
      } catch (error: any) {
        console.error('Error fetching todos:', error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getTodos();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading todos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      {todos.length > 0 ? (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.todoItem}>
              <Text 
                style={[
                  styles.todoText, 
                  item.completed && styles.completedTodo
                ]}
              >
                {item.title}
              </Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>No todos found. Create some in your Supabase database!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  todoItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    width: '100%',
  },
  todoText: {
    fontSize: 16,
    color: '#fff',
  },
  completedTodo: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
}); 