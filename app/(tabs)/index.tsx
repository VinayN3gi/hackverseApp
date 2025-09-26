"use client";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy checkpoint data for one driver
const checkpoints = [
  { name: "Depot", reached: true, time: "09:00 AM" },
  { name: "Highway Checkpoint", reached: true, time: "11:15 AM" },
  { name: "City Storage Yard", reached: false, time: null },
  { name: "Petroleum Plant", reached: false, time: null },
];

// Header
const Header = () => (
  <View className="w-full bg-blue-700 py-4 rounded-lg shadow mb-4">
    <Text className="text-center text-2xl font-bold text-white">
      Driver Dashboard
    </Text>
    <Text className="text-center text-sm text-blue-100">
      Track your journey and ask AI for assistance
    </Text>
  </View>
);

// Checkpoint Panel
const CheckpointPanel = ({ checkpoints }: any) => (
  <View className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-4">
    <Text className="text-lg font-semibold text-gray-800 mb-3">
      My Checkpoints
    </Text>
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {checkpoints.map((cp: any, index: number) => (
        <View key={index} className="flex-row items-start relative mb-5">
          {index !== checkpoints.length - 1 && (
            <View
              className={`absolute left-4 top-6 w-[2px] h-full ${
                cp.reached ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          )}
          <View
            className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
              cp.reached ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            <Text className="text-white font-bold text-xs">{index + 1}</Text>
          </View>
          <View className="ml-4">
            <Text
              className={`${cp.reached ? "text-green-700" : "text-gray-900"} font-medium`}
            >
              {cp.name}
            </Text>
            {cp.time && (
              <Text className="text-sm text-gray-500">{cp.time}</Text>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  </View>
);

// Chat input bar pinned at bottom
const ChatInputBar = ({ onSend, loading }: any) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.inputWrapper}>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Type your question..."
        returnKeyType="send"
        onSubmitEditing={handleSend}
        editable={!loading}
        style={styles.textInput}
      />
      <TouchableOpacity
        onPress={handleSend}
        style={[styles.sendButton, loading && { backgroundColor: "#9ca3af" }]}
        disabled={loading}
      >
        <Text style={styles.sendButtonText}>
          {loading ? "Sending..." : "Send"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function DriverScreen() {
  const [response, setResponse] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSendPrompt = async (prompt: string) => {
    try {
      setLoading(true);
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful AI assistant for a delivery driver.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });

      const data = await res.json();
      const answer =
        data.choices?.[0]?.message?.content || "No response received";

      setResponse(answer);
      setModalVisible(true);
    } catch (error) {
      console.error(error);
      setResponse("Error fetching response");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const sendNotif = () => {
    async function sendCheckpoint() {
      let ngrokUrl = "https://b253e9f9b998.ngrok-free.app";
      await fetch(`${ngrokUrl}/api/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Reached Checkpoint 2" }),
      });
    }
    sendCheckpoint();
  };

  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 80;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <View style={{ flex: 1, padding: 16 }}>
            <Header />
            <CheckpointPanel checkpoints={checkpoints} />

            <TouchableOpacity onPress={sendNotif} style={styles.sendButton}>
              <Text style={styles.sendButtonText}>Reached Checkpoint</Text>
            </TouchableOpacity>

            {/* Input pinned to bottom */}
            <ChatInputBar onSend={handleSendPrompt} loading={loading} />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Modal for AI Answer */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>AI Assistant</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={styles.modalText}>{response}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    marginTop: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    color: "#111827",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalBox: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1d4ed8",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#111827",
    lineHeight: 22,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
