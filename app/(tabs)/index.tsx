'use client'
import React, { useState, useEffect } from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Dummy checkpoint data
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
              className={`${
                cp.reached ? "text-green-700" : "text-gray-900"
              } font-medium`}
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

// Chat input bar
const ChatInputBar = ({ onSend, loading }: any) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
    Keyboard.dismiss();
  };

  return (
    <View className="flex-row items-center bg-white border border-gray-200 rounded-3xl px-3 py-2 shadow shadow-black/5 mt-3">
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Type your question..."
        placeholderTextColor="#9ca3af"
        returnKeyType="send"
        onSubmitEditing={handleSend}
        editable={!loading}
        className="flex-1 text-base text-gray-900 px-2"
      />

      <TouchableOpacity
        onPress={handleSend}
        disabled={loading}
        className={`ml-2 px-5 py-3 rounded-2xl ${
          loading ? "bg-gray-400" : "bg-blue-600 active:bg-blue-700"
        }`}
      >
        <Text className="text-white font-bold">
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
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();

  // Listen for keyboard show/hide
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
      let ngrokUrl = "https://3dc625cc30e7.ngrok-free.app";
      await fetch(`${ngrokUrl}/api/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Reached Checkpoint 1" }),
      });
      console.log("Message sent");
    }
    sendCheckpoint();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={insets.bottom}
        >
          <View className="flex-1 px-4">
            <Header />
            <CheckpointPanel checkpoints={checkpoints} />

            {/* Show only when keyboard is NOT visible */}
            {!isKeyboardVisible && (
              <TouchableOpacity
                onPress={sendNotif}
                className="w-full bg-green-600 py-4 mb-6 rounded-2xl flex-row items-center justify-center shadow shadow-black/10 active:bg-green-700"
              >
                <Text className="text-white text-lg font-bold">
                  Reached Checkpoint
                </Text>
              </TouchableOpacity>
            )}

            <View className="mt-auto mb-2">
              <ChatInputBar onSend={handleSendPrompt} loading={loading} />
            </View>
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
