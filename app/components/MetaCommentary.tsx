import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../config/supabase';
import { haptics } from '../utils/animations';

interface MetaCommentaryProps {
  user: User;
}

const MetaCommentary: React.FC<MetaCommentaryProps> = ({ user }) => {
  const [showImpact, setShowImpact] = useState(false);
  
  // Calculate what the user could have done with their money
  const calculateAlternatives = () => {
    const amount = user.purchase_amount;
    
    return {
      meals: Math.floor(amount / 10), // $10 per meal
      trees: Math.floor(amount / 5), // $5 per tree
      water: Math.floor(amount * 20), // 20 gallons per dollar
      books: Math.floor(amount / 15), // $15 per book
      vaccines: Math.floor(amount / 30), // $30 per vaccine
    };
  };
  
  const alternatives = calculateAlternatives();
  
  // Generate a shareable message that's both funny and self-aware
  const generateShareMessage = () => {
    const tierMessage = {
      'god': "I just spent $99,999 on an app that literally does nothing. That's how rich I am.",
      'elite': "I just spent $9,999 on an app that has zero function. Stay poor, peasants.",
      'regular': "I just spent $999 on an app that does absolutely nothing. Because I can."
    }[user.tier];
    
    const randomTag = [
      "#WealthFlexing",
      "#StayPoor",
      "#BecauseICan",
      "#WealthyThings",
      "#MoneyToSpare",
      "#RichLifeProblems"
    ][Math.floor(Math.random() * 6)];
    
    return `${tierMessage}\n\nInstead of feeding ${alternatives.meals} hungry people, I bought digital nothing.\n\n${randomTag}`;
  };
  
  // Share the absurdity
  const handleShare = async () => {
    haptics.medium();
    
    try {
      const result = await Share.share({
        message: generateShareMessage(),
        title: 'The Nothing App - Yes, I paid for this.'
      });
      
      if (result.action === Share.sharedAction) {
        haptics.success();
        Alert.alert(
          "Wealth Flex Shared",
          "Your friends will be so jealous that you wasted money on absolutely nothing."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Couldn't share your wealth flex.");
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="information-circle-outline" size={24} color="#D4AF37" />
        <Text style={styles.headerText}>META WEALTH AWARENESS</Text>
      </View>
      
      <Text style={styles.absurdityText}>
        Yes, you spent {user.tier === 'god' ? '$99,999' : user.tier === 'elite' ? '$9,999' : '$999'} on an app that does absolutely nothing.
      </Text>
      
      <Text style={styles.justificationText}>
        That's the point. Your purchase proves you don't need to justify your spending.
      </Text>
      
      <TouchableOpacity 
        style={styles.impactButton}
        onPress={() => {
          setShowImpact(!showImpact);
          haptics.light();
        }}
      >
        <Text style={styles.impactButtonText}>
          {showImpact ? "HIDE IMPACT CALCULATOR" : "SHOW IMPACT CALCULATOR"}
        </Text>
      </TouchableOpacity>
      
      {showImpact && (
        <View style={styles.impactContainer}>
          <Text style={styles.impactTitle}>WITH YOUR PURCHASE AMOUNT, YOU COULD HAVE:</Text>
          <View style={styles.impactItems}>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>{alternatives.meals}</Text>
              <Text style={styles.impactLabel}>Meals for the hungry</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>{alternatives.trees}</Text>
              <Text style={styles.impactLabel}>Trees planted</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>{alternatives.water}</Text>
              <Text style={styles.impactLabel}>Gallons of clean water</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>{alternatives.books}</Text>
              <Text style={styles.impactLabel}>Books for children</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>{alternatives.vaccines}</Text>
              <Text style={styles.impactLabel}>Vaccines provided</Text>
            </View>
          </View>
          <Text style={styles.impactConclusion}>
            Instead, you bought absolutely nothing. Congrats!
          </Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.shareButton}
        onPress={handleShare}
      >
        <Ionicons name="share-social" size={20} color="#FFF" />
        <Text style={styles.shareButtonText}>SHARE THIS ABSURDITY</Text>
      </TouchableOpacity>
      
      <Text style={styles.footnoteText}>
        * The Nothing App: Where the wealthy pay for emptiness.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  absurdityText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  justificationText: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  impactButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  impactButtonText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  impactContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  impactTitle: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  impactItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  impactItem: {
    width: '48%',
    marginBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 6,
  },
  impactValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  impactLabel: {
    color: '#999',
    fontSize: 12,
  },
  impactConclusion: {
    color: '#FFF',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  shareButton: {
    backgroundColor: '#D4AF37',
    padding: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  shareButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footnoteText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default MetaCommentary; 