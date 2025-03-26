import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Collection of cryptic messages that hint at exclusivity and mysteries
const CRYPTIC_MESSAGES = [
  { id: '1', message: 'Tuesday is green. You know what that means.', icon: 'key-outline' },
  { id: '2', message: 'The council has approved the next phase.', icon: 'people-outline' },
  { id: '3', message: 'Look for the falcon at midnight.', icon: 'time-outline' },
  { id: '4', message: 'Three knocks, pause, two knocks.', icon: 'hand-left-outline' },
  { id: '5', message: 'The 7th floor is now accessible.', icon: 'arrow-up-outline' },
  { id: '6', message: 'Orchid season begins next week.', icon: 'flower-outline' },
  { id: '7', message: 'The blackout protocol has been initiated.', icon: 'moon-outline' },
  { id: '8', message: 'Members are advised to check private channels.', icon: 'chatbubble-outline' },
  { id: '9', message: 'Eastern gates now require new credentials.', icon: 'enter-outline' },
  { id: '10', message: 'The package arrives at dawn.', icon: 'cube-outline' },
  { id: '11', message: 'Coordinates have been updated.', icon: 'location-outline' },
  { id: '12', message: 'Whisper protocol is active.', icon: 'volume-low-outline' },
];

interface CrypticMessageProps {
  tier: 'regular' | 'elite' | 'god';
}

const CrypticMessage: React.FC<CrypticMessageProps> = ({ tier }) => {
  const [message, setMessage] = useState(CRYPTIC_MESSAGES[0]);
  const [showHint, setShowHint] = useState(false);
  
  // Different tiers see different messages - higher tiers see more exclusive ones
  useEffect(() => {
    let availableMessages: typeof CRYPTIC_MESSAGES;
    
    if (tier === 'god') {
      // God tier sees all messages
      availableMessages = CRYPTIC_MESSAGES;
    } else if (tier === 'elite') {
      // Elite tier sees first 8 messages
      availableMessages = CRYPTIC_MESSAGES.slice(0, 8);
    } else {
      // Regular tier only sees first 4 messages
      availableMessages = CRYPTIC_MESSAGES.slice(0, 4);
    }
    
    // Select a random message
    const randomIndex = Math.floor(Math.random() * availableMessages.length);
    setMessage(availableMessages[randomIndex]);
    
    // Change message periodically
    const interval = setInterval(() => {
      const newIndex = Math.floor(Math.random() * availableMessages.length);
      setMessage(availableMessages[newIndex]);
      setShowHint(false);
    }, 120000); // Change every 2 minutes
    
    return () => clearInterval(interval);
  }, [tier]);
  
  // Choose background based on tier
  const getBackgroundStyle = () => {
    switch (tier) {
      case 'god':
        return styles.godBackground;
      case 'elite':
        return styles.eliteBackground;
      default:
        return styles.regularBackground;
    }
  };
  
  return (
    <View style={[styles.container, getBackgroundStyle()]}>
      <View style={styles.header}>
        <Ionicons name="alert-circle-outline" size={20} color="#D4AF37" />
        <Text style={styles.headerText}>INSIDER INTELLIGENCE</Text>
      </View>
      
      <View style={styles.messageContainer}>
        <Ionicons name={message.icon as any} size={24} color="#FFF" style={styles.messageIcon} />
        <Text style={styles.message}>{message.message}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.hintButton}
        onPress={() => setShowHint(!showHint)}
      >
        <Text style={styles.hintButtonText}>
          {showHint ? 'HIDE HINT' : 'SHOW HINT'}
        </Text>
      </TouchableOpacity>
      
      {showHint && (
        <Text style={styles.hintText}>
          {tier === 'god'
            ? 'Access granted to special event. Check your private messages.'
            : tier === 'elite'
              ? 'Upgrade to God Mode to decode this message fully.'
              : 'This message is partially encrypted. Upgrade your membership for full access.'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
  },
  regularBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderColor: '#555',
  },
  eliteBackground: {
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderColor: '#888',
  },
  godBackground: {
    backgroundColor: 'rgba(50, 40, 10, 0.7)',
    borderColor: '#D4AF37',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  messageIcon: {
    marginRight: 10,
  },
  message: {
    color: '#FFF',
    fontSize: 16,
    fontStyle: 'italic',
    flex: 1,
  },
  hintButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 4,
  },
  hintButtonText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  hintText: {
    color: '#AAA',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default CrypticMessage; 