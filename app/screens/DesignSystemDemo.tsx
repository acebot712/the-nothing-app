import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  theme,
  Text,
  Container,
  Button,
  Card,
  Avatar,
  Badge,
  Input,
  Divider,
  Modal,
  Loader,
} from "../design";
import { Ionicons } from "@expo/vector-icons";

const DesignSystemDemo = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <Container useSafeArea style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text variant="h1" color="primary">
            Design System
          </Text>
          <Text variant="subtitle1">A showcase of UI components</Text>
        </View>

        {/* Typography */}
        <Card style={styles.card}>
          <Text variant="h3" color="primary">
            Typography
          </Text>
          <Divider margin={theme.spacing.md} />
          <Text variant="h1">Heading 1</Text>
          <Text variant="h2">Heading 2</Text>
          <Text variant="h3">Heading 3</Text>
          <Text variant="h4">Heading 4</Text>
          <Text variant="subtitle1">Subtitle 1</Text>
          <Text variant="subtitle2">Subtitle 2</Text>
          <Text variant="body1">Body 1 - Main text size</Text>
          <Text variant="body2">Body 2 - Smaller text size</Text>
          <Text variant="caption">Caption - Very small text</Text>
          <Text variant="button">BUTTON TEXT</Text>
        </Card>

        {/* Colors */}
        <Card style={styles.card}>
          <Text variant="h3" color="primary">
            Colors
          </Text>
          <Divider margin={theme.spacing.md} />
          <View style={styles.row}>
            <View
              style={[
                styles.colorBox,
                { backgroundColor: theme.colors.primary.main },
              ]}
            >
              <Text variant="caption" color="inverse">
                Primary
              </Text>
            </View>
            <View
              style={[
                styles.colorBox,
                { backgroundColor: theme.colors.secondary.main },
              ]}
            >
              <Text variant="caption">Secondary</Text>
            </View>
            <View
              style={[
                styles.colorBox,
                { backgroundColor: theme.colors.gold.main },
              ]}
            >
              <Text variant="caption">Gold</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View
              style={[
                styles.colorBox,
                { backgroundColor: theme.colors.status.success },
              ]}
            >
              <Text variant="caption" color="inverse">
                Success
              </Text>
            </View>
            <View
              style={[
                styles.colorBox,
                { backgroundColor: theme.colors.status.error },
              ]}
            >
              <Text variant="caption" color="inverse">
                Error
              </Text>
            </View>
            <View
              style={[
                styles.colorBox,
                { backgroundColor: theme.colors.status.warning },
              ]}
            >
              <Text variant="caption">Warning</Text>
            </View>
          </View>
        </Card>

        {/* Buttons */}
        <Card style={styles.card}>
          <Text variant="h3" color="primary">
            Buttons
          </Text>
          <Divider margin={theme.spacing.md} />
          <View style={styles.buttonRow}>
            <Button title="Primary" variant="primary" />
            <Button title="Secondary" variant="secondary" />
          </View>
          <View style={styles.buttonRow}>
            <Button title="Tertiary" variant="tertiary" />
            <Button title="Ghost" variant="ghost" />
          </View>
          <View style={styles.buttonRow}>
            <Button title="Danger" variant="danger" />
            <Button title="Gold" variant="gold" />
          </View>
          <View style={styles.buttonRow}>
            <Button
              title="With Icon"
              leftIcon={<Ionicons name="star" size={16} color="white" />}
            />
            <Button title="Loading" isLoading />
          </View>
          <Button
            title="Full Width Button"
            fullWidth
            style={styles.fullWidthButton}
          />
        </Card>

        {/* Avatars and Badges */}
        <Card style={styles.card}>
          <Text variant="h3" color="primary">
            Avatars & Badges
          </Text>
          <Divider margin={theme.spacing.md} />
          <View style={styles.row}>
            <Avatar size="sm" name="John Doe" status="online" />
            <Avatar size="md" name="Jane Smith" status="away" />
            <Avatar size="lg" name="Robert Brown" premium status="offline" />
          </View>
          <View style={[styles.row, styles.spacedRow]}>
            <Badge tier="regular" />
            <Badge tier="elite" />
            <Badge tier="god" />
          </View>
          <View style={[styles.row, styles.spacedRow]}>
            <Badge tier="regular" size="sm" />
            <Badge tier="elite" size="md" />
            <Badge tier="god" size="lg" />
          </View>
        </Card>

        {/* Form Elements */}
        <Card style={styles.card}>
          <Text variant="h3" color="primary">
            Form Elements
          </Text>
          <Divider margin={theme.spacing.md} />
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            leftIcon={<Ionicons name="mail" size={20} color="#777" />}
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed" size={20} color="#777" />}
          />
          <Input
            label="Error Example"
            value="invalid@email"
            error="Please enter a valid email address"
          />
          <Button
            title="Submit"
            onPress={handleLogin}
            style={styles.submitButton}
            isLoading={loading}
          />
        </Card>

        {/* Dividers */}
        <Card style={styles.card}>
          <Text variant="h3" color="primary">
            Dividers
          </Text>
          <Divider margin={theme.spacing.md} />
          <Divider size="thin" />
          <View style={styles.verticalSpacer} />
          <Divider size="medium" />
          <View style={styles.verticalSpacer} />
          <Divider size="thick" />
          <View style={styles.verticalSpacer} />
          <Divider label="OR" labelPosition="center" />
          <View style={styles.verticalSpacer} />
          <Divider label="LEFT" labelPosition="left" />
          <View style={styles.verticalSpacer} />
          <Divider label="RIGHT" labelPosition="right" />
        </Card>

        {/* Modal */}
        <Card style={styles.card}>
          <Text variant="h3" color="primary">
            Modal & Loader
          </Text>
          <Divider margin={theme.spacing.md} />
          <Button
            title="Open Modal"
            onPress={() => setModalVisible(true)}
            style={styles.modalButton}
          />
          <View style={styles.loaderContainer}>
            <Loader type="spinner" size="small" />
            <Loader
              type="dots"
              size="small"
              color={theme.colors.primary.main}
            />
            <Loader type="pulse" size="small" color={theme.colors.gold.main} />
          </View>
        </Card>

        <View style={styles.footer}>
          <Text variant="caption" color="tertiary" align="center">
            The Nothing App Design System • Created with ♥
          </Text>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        position="center"
      >
        <View style={styles.modalContent}>
          <Text variant="h3" color="primary">
            Design System Modal
          </Text>
          <Text>This is a modal component from our design system.</Text>
          <Button
            title="Close"
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
          />
        </View>
      </Modal>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
  },
  section: {
    marginVertical: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  row: {
    flexDirection: "row",
    marginVertical: theme.spacing.sm,
  },
  spacedRow: {
    justifyContent: "space-around",
    alignItems: "center",
  },
  colorBox: {
    width: 100,
    height: 60,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    ...theme.elevation.shadow.sm,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  fullWidthButton: {
    marginTop: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  verticalSpacer: {
    height: theme.spacing.md,
  },
  modalButton: {
    marginBottom: theme.spacing.md,
  },
  modalContent: {
    padding: theme.spacing.md,
  },
  closeButton: {
    marginTop: theme.spacing.xl,
  },
  loaderContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: theme.spacing.md,
  },
  footer: {
    marginVertical: theme.spacing.xl,
  },
});

export default DesignSystemDemo;
