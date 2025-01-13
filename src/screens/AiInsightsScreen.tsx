import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import Constants from "expo-constants";

export default function AiInsightsScreen() {
  const [userPrompt, setUserPrompt] = useState("");
  const [insight, setInsight] = useState("No insights yet.");
  const [loading, setLoading] = useState(false);

  const openAiApiKey =
    Constants.expoConfig?.extra?.OPENAI_API_KEY ||
    Constants.manifest?.extra?.OPENAI_API_KEY ||
    "";

  if (!openAiApiKey) {
    console.warn(
      "Warning: OPENAI_API_KEY is missing. Provide it in app.json -> expo.extra."
    );
  }

  const fetchInsight = async () => {
    if (!openAiApiKey) {
      Alert.alert("Error", "OpenAI API key is not configured.");
      return;
    }

    if (!userPrompt.trim()) {
      Alert.alert("Error", "Please enter a question or prompt.");
      return;
    }

    setLoading(true);
    setInsight("...thinking...");

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful financial assistant for the LoopBook app.",
            },
            {
              role: "user",
              content: userPrompt.trim(),
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "No response.";
      setInsight(content.trim());
    } catch (err: any) {
      console.error("AI fetch error:", err);
      Alert.alert("Error", err.message || "Failed to get AI insights.");
      setInsight("Error retrieving insights.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI-Powered Insights</Text>
      <Text style={styles.subtitle}>
        Ask a financial question or get expense advice:
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g., How can I reduce monthly expenses?"
        value={userPrompt}
        onChangeText={setUserPrompt}
      />

      <TouchableOpacity style={styles.button} onPress={fetchInsight}>
        <Text style={styles.buttonText}>
          {loading ? "Getting Insight..." : "Get AI Insight"}
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <Text style={styles.insightText}>{insight}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 10, color: "#555" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    color: "#333",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  insightText: { fontSize: 16, marginTop: 10, color: "#333" },
});
